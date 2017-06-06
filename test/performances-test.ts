/**
 * performancesルーターテスト
 *
 * @ignore
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as supertest from 'supertest';

import * as app from '../app/app';

let connection: mongoose.Connection;
const TEST_THEATER_ID = '118';
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});

describe('パフォーマンス検索', () => {
    it('ok', async () => {
        await supertest(app)
            .get('/performances')
            .query({
                theater: TEST_THEATER_ID,
                day: moment().format('YYYYMMDD')
            })
            .set('authorization', `Bearer ${process.env.SSKTS_API_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                assert(Array.isArray(response.body.data));
            });
    });

    it('検索条件に劇場が足りない', async () => {
        await supertest(app)
            .get('/performances')
            .query({
                day: moment().format('YYYYMMDD')
            })
            .set('authorization', `Bearer ${process.env.SSKTS_API_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert(Array.isArray(response.body.errors));
                assert.equal(response.body.errors[0].source.parameter, 'theater');
            });
    });
});

describe('GET /performances/:id', () => {
    before(async () => {
        // 全て削除してからテスト開始
        const performanceAdapter = sskts.adapter.performance(connection);
        await performanceAdapter.model.remove({}).exec();
    });

    it('not found', async () => {
        await supertest(app)
            .get('/performances/0000000000')
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
        const filmAdapter = sskts.adapter.film(connection);
        const screenAdapter = sskts.adapter.screen(connection);
        const performanceAdapter = sskts.adapter.performance(connection);
        await sskts.service.master.importTheater(TEST_THEATER_ID)(theaterAdapter);
        await sskts.service.master.importScreens(TEST_THEATER_ID)(theaterAdapter, screenAdapter);
        await sskts.service.master.importFilms(TEST_THEATER_ID)(theaterAdapter, filmAdapter);
        await sskts.service.master.importPerformances(
            TEST_THEATER_ID,
            '20170301',
            '20170303'
        )(filmAdapter, screenAdapter, performanceAdapter);

        const performanceDoc = await performanceAdapter.model.findOne().exec();

        await supertest(app)
            .get(`/performances/${performanceDoc.get('id')}`)
            .set('authorization', `Bearer ${process.env.SSKTS_API_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                assert.equal(response.body.data.type, 'performances');
                assert.equal(response.body.data.id, performanceDoc.get('id'));
                assert.equal(response.body.data.attributes.id, performanceDoc.get('id'));
            });
    });
});
