/**
 * theatersルーターテスト
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as supertest from 'supertest';

import * as app from '../../app/app';
import * as Resources from '../resources';
import * as OAuthScenario from '../scenarios/oauth';

let connection: mongoose.Connection;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    // 全て削除してからテスト開始
    const theaterAdapter = sskts.adapter.theater(connection);
    await theaterAdapter.model.remove({}).exec();
});

describe('GET /theaters/:id', () => {
    it('アクセストークン必須', async () => {
        await supertest(app)
            .get('/theaters/0000000000')
            .expect(httpStatus.UNAUTHORIZED);
    });

    it('not found', async () => {
        const accessToken = await OAuthScenario.loginAsAdmin();

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
        await Resources.importMasters(moment().add(1, 'days').toDate());

        // テストデータインポート
        const theaterAdapter = sskts.adapter.theater(connection);
        const theaterDoc = await theaterAdapter.model.findOne().exec();
        if (theaterDoc === null) {
            throw new Error('test data not imported');
        }

        const accessToken = await OAuthScenario.loginAsAdmin();

        await supertest(app)
            .get(`/theaters/${theaterDoc.get('id')}`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                assert.equal(response.body.data.type, 'theaters');
                assert.equal(response.body.data.id, theaterDoc.get('id'));
            });
    });
});

describe('劇場検索', () => {
    before(async () => {
        // テストデータインポート
        await Resources.importMasters(moment().add(1, 'days').toDate());
    });

    it('アクセストークン必須', async () => {
        await supertest(app)
            .get('/theaters')
            .expect(httpStatus.UNAUTHORIZED);
    });

    it('レスポンスの型が適切', async () => {
        const accessToken = await OAuthScenario.loginAsAdmin();

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
