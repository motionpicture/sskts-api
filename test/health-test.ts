/**
 * healthルーターテスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as mongoose from 'mongoose';
import * as supertest from 'supertest';

import * as app from '../app/app';
import * as redis from '../redis';

const MONGOOSE_CONNECTION_READY_STATE_CONNECTED = 1;
const INTERVALS_CHECK_CONNECTION = 2000;

let connection: mongoose.Connection;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});

describe('ヘルスチェック', () => {
    it('mongodbとredisに接続済みであれば健康', async () => {
        await new Promise((resolve, reject) => {
            const timer = setInterval(
                async () => {
                    if (mongoose.connection.readyState !== MONGOOSE_CONNECTION_READY_STATE_CONNECTED || !redis.getClient().connected) {
                        return;
                    }

                    clearInterval(timer);

                    try {
                        await supertest(app)
                            .get('/health')
                            .set('Accept', 'application/json')
                            .expect(httpStatus.OK)
                            .then((response) => {
                                assert.equal(response.text, 'healthy!');
                            });

                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                },
                INTERVALS_CHECK_CONNECTION
            );
        });
    });

    it('mongodb接続切断後アクセスすればBAD_REQUEST', async () => {
        await new Promise((resolve, reject) => {
            const timer = setInterval(
                () => {
                    if (mongoose.connection.readyState !== MONGOOSE_CONNECTION_READY_STATE_CONNECTED || !redis.getClient().connected) {
                        return;
                    }

                    clearInterval(timer);

                    try {
                        mongoose.connection.close(async () => {
                            await supertest(app)
                                .get('/health')
                                .set('Accept', 'application/json')
                                .expect(httpStatus.BAD_REQUEST)
                                .then();

                            // mongodb接続しなおす
                            mongoose.connect(process.env.MONGOLAB_URI, (err: any) => {
                                if (err instanceof Error) {
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            });
                        });
                    } catch (error) {
                        reject(error);
                    }
                },
                INTERVALS_CHECK_CONNECTION
            );
        });
    });
});
