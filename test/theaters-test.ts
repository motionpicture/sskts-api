/**
 * theatersルーターテスト
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as mongoose from 'mongoose';
import * as supertest from 'supertest';

import * as app from '../app/app';

const TEST_VALID_THEATER_ID = '118';
let connection: mongoose.Connection;
let accessToken: string;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    accessToken = await supertest(app)
        .post('/oauth/token')
        .send({
            assertion: process.env.SSKTS_API_REFRESH_TOKEN,
            scope: 'admin'
        })
        .then((response) => {
            return <string>response.body.access_token;
        });

    // 全て削除してからテスト開始
    const theaterAdapter = sskts.adapter.theater(connection);
    await theaterAdapter.model.remove({}).exec();
});

describe('GET /theaters/:id', () => {
    it('アクセストークン必須', async () => {
        await supertest(app)
            .get('/theaters/0000000000')
            .expect(httpStatus.UNAUTHORIZED)
            .then((response) => {
                assert.equal(response.text, 'Unauthorized');
            });
    });

    it('not found', async () => {
        await supertest(app)
            .get('/theaters/0000000000')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.NOT_FOUND)
            .then((response) => {
                assert.equal(response.body.data, null);
            });
    });

    it('found', async () => {
        // テストデータインポート
        const theaterAdapter = sskts.adapter.theater(connection);
        await sskts.service.master.importTheater(TEST_VALID_THEATER_ID)(theaterAdapter);

        const theaterDoc = await theaterAdapter.model.findOne().exec();
        if (theaterDoc === null) {
            throw new Error('test data not imported');
        }

        await supertest(app)
            .get(`/theaters/${theaterDoc.get('id')}`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                assert.equal(response.body.data.type, 'theaters');
                assert.equal(response.body.data.id, theaterDoc.get('id'));
                assert.equal(response.body.data.attributes.id, theaterDoc.get('id'));
            });
    });
});

describe('劇場検索', () => {
    before(async () => {
        // テストデータインポート
        const theaterAdapter = sskts.adapter.theater(connection);
        await sskts.service.master.importTheater(TEST_VALID_THEATER_ID)(theaterAdapter);
    });

    it('アクセストークン必須', async () => {
        await supertest(app)
            .get('/theaters')
            .expect(httpStatus.UNAUTHORIZED)
            .then((response) => {
                assert.equal(response.text, 'Unauthorized');
            });
    });

    it('レスポンスの型が適切', async () => {
        await supertest(app)
            .get('/theaters')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                assert(Array.isArray(response.body.data));
                assert((<any[]>response.body.data).length > 0);
                (<any[]>response.body.data).forEach((theater) => {
                    assert.equal(theater.type, 'theaters');
                });
            });
    });
});
