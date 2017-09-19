/**
 * filmsルーターテスト
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

describe('GET /people/me/contacts', () => {
    it('ok', async () => {
        const accessToken = '';

        await supertest(app)
            .get('/people/me/contacts')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                assert.notEqual(response.body.data, null);
            });
    });
});
