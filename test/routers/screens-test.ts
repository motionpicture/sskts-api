/**
 * screensルーターテスト
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

    // 全て削除してからテスト開始
    const screenAdapter = sskts.adapter.screen(connection);
    await screenAdapter.model.remove({}).exec();
});

describe('GET /screens/:id', () => {
    it('アクセストークン必須', async () => {
        await supertest(app)
            .get('/screens/0000000000')
            .expect(httpStatus.UNAUTHORIZED);
    });

    it('not found', async () => {
        const accessToken = await OAuthScenario.loginAsAdmin();

        await supertest(app)
            .get('/screens/0000000000')
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

        const screenAdapter = sskts.adapter.screen(connection);
        const screenDoc = await screenAdapter.model.findOne().exec();
        if (screenDoc === null) {
            throw new Error('test data not imported');
        }

        const accessToken = await OAuthScenario.loginAsAdmin();

        await supertest(app)
            .get(`/screens/${screenDoc.get('id')}`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                assert.equal(response.body.data.type, 'screens');
                assert.equal(response.body.data.id, screenDoc.get('id'));
            });
    });
});
