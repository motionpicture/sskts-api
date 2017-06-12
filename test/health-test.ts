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
import redisClient from '../redisClient';

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
                    if (mongoose.connection.readyState !== MONGOOSE_CONNECTION_READY_STATE_CONNECTED || !redisClient.connected) {
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

    it('mongodb接続切断後、アクセスすれば健康になる', async () => {
        await new Promise((resolve, reject) => {
            const timer = setInterval(
                () => {
                    if (mongoose.connection.readyState !== MONGOOSE_CONNECTION_READY_STATE_CONNECTED || !redisClient.connected) {
                        return;
                    }

                    clearInterval(timer);

                    try {
                        mongoose.disconnect(async () => {
                            // mongodb切断確認
                            assert.notEqual(mongoose.connection.readyState, MONGOOSE_CONNECTION_READY_STATE_CONNECTED);

                            await supertest(app)
                                .get('/health')
                                .set('Accept', 'application/json')
                                .expect(httpStatus.OK)
                                .then((response) => {
                                    assert.equal(response.text, 'healthy!');
                                    // mongodb接続確認
                                    assert.equal(mongoose.connection.readyState, MONGOOSE_CONNECTION_READY_STATE_CONNECTED);
                                });

                            resolve();
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
