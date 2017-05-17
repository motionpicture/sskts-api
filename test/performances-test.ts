/**
 * performancesルーターテスト
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
const theaterId = '118';
before(async () => {
    // 全て削除してからテスト開始
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    const performanceAdapter = sskts.adapter.performance(connection);
    await performanceAdapter.model.remove({}).exec();
});

describe('GET /performances/:id', () => {
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
        await sskts.service.master.importTheater(theaterId)(theaterAdapter);
        await sskts.service.master.importScreens(theaterId)(theaterAdapter, screenAdapter);
        await sskts.service.master.importFilms(theaterId)(theaterAdapter, filmAdapter);
        await sskts.service.master.importPerformances(theaterId, '20170301', '20170303')(filmAdapter, screenAdapter, performanceAdapter);

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
