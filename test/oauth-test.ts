/**
 * oauthルーターテスト
 *
 * @ignore
 */
import * as assert from 'assert';
import * as HTTPStatus from 'http-status';
import * as supertest from 'supertest';

import * as app from '../app/app';

describe('GET /oauth/token', () => {
    it('found', (done) => {
        supertest(app)
            .post('/oauth/token')
            .send({
                assertion: process.env.SSKTS_API_REFRESH_TOKEN,
                scope: 'admin'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(HTTPStatus.OK)
            .then((response) => {
                assert(typeof response.body.access_token === 'string');
                assert(typeof response.body.token_type === 'string');
                assert(Number.isInteger(response.body.expires_in));
                done();
            }).catch((err) => {
                done(err);
            });
    });
});
