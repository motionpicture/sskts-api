/**
 * performancesルーターテスト
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as moment from 'moment';
import * as supertest from 'supertest';

import * as app from '../../app/app';
import * as Resources from '../resources';
import * as OAuthScenario from '../scenarios/oauth';

let connection: sskts.mongoose.Connection;
before(async () => {
    connection = sskts.mongoose.createConnection(process.env.MONGOLAB_URI);
});

describe('パフォーマンス検索', () => {
    it('アクセストークン必須', async () => {
        await supertest(app)
            .get('/performances')
            .expect(httpStatus.UNAUTHORIZED);
    });

    it('ok', async () => {
        const accessToken = await OAuthScenario.loginAsAdmin();

        await supertest(app)
            .get('/performances')
            .query({
                theater: Resources.THEATER_ID,
                day: moment().format('YYYYMMDD')
            })
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                assert(Array.isArray(response.body.data));
            });
    });

    it('検索条件に劇場が足りない', async () => {
        const accessToken = await OAuthScenario.loginAsAdmin();

        await supertest(app)
            .get('/performances')
            .query({
                day: moment().format('YYYYMMDD')
            })
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert(Array.isArray(response.body.errors));
            });
    });
});

describe('GET /performances/:id', () => {
    before(async () => {
        // 全て削除してからテスト開始
        const performanceAdapter = sskts.adapter.performance(connection);
        await performanceAdapter.model.remove({}).exec();
    });

    it('アクセストークン必須', async () => {
        await supertest(app)
            .get('/performances/0000000000')
            .expect(httpStatus.UNAUTHORIZED);
    });

    it('not found', async () => {
        const accessToken = await OAuthScenario.loginAsAdmin();

        await supertest(app)
            .get('/performances/0000000000')
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

        const performanceAdapter = sskts.adapter.performance(connection);
        const performanceDoc = await performanceAdapter.model.findOne().exec();
        if (performanceDoc === null) {
            throw new Error('test data not imported');
        }

        const accessToken = await OAuthScenario.loginAsAdmin();

        await supertest(app)
            .get(`/performances/${performanceDoc.get('id')}`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                assert.equal(response.body.data.type, 'performances');
                assert.equal(response.body.data.id, performanceDoc.get('id'));
            });
    });
});
