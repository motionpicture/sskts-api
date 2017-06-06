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

let connection: mongoose.Connection;
const TEST_VALID_THEATER_ID = '118';

before(async () => {
    // 全て削除してからテスト開始
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    const theaterAdapter = sskts.adapter.theater(connection);
    await theaterAdapter.model.remove({}).exec();
});

describe('GET /theaters/:id', () => {
    it('not found', async () => {
        await supertest(app)
            .get('/theaters/0000000000')
            .set('authorization', `Bearer ${process.env.SSKTS_API_ACCESS_TOKEN}`)
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

        await supertest(app)
            .get(`/theaters/${theaterDoc.get('id')}`)
            .set('authorization', `Bearer ${process.env.SSKTS_API_ACCESS_TOKEN}`)
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

    it('レスポンスの型が適切', async () => {
        await supertest(app)
            .get('/theaters')
            .set('authorization', `Bearer ${process.env.SSKTS_API_ACCESS_TOKEN}`)
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
