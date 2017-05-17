/**
 * screensルーターテスト
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
    const screenAdapter = sskts.adapter.screen(connection);
    await screenAdapter.model.remove({}).exec();
});

describe('GET /screens/:id', () => {
    it('not found', async () => {
        await supertest(app)
            .get('/screens/0000000000')
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
        const screenAdapter = sskts.adapter.screen(connection);
        await sskts.service.master.importTheater(theaterId)(theaterAdapter);
        await sskts.service.master.importScreens(theaterId)(theaterAdapter, screenAdapter);

        const screenDoc = await screenAdapter.model.findOne().exec();

        await supertest(app)
            .get(`/screens/${screenDoc.get('id')}`)
            .set('authorization', `Bearer ${process.env.SSKTS_API_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                assert.equal(response.body.data.type, 'screens');
                assert.equal(response.body.data.id, screenDoc.get('id'));
                assert.equal(response.body.data.attributes.id, screenDoc.get('id'));
            });
    });
});
