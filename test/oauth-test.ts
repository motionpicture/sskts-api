/**
 * oauthルーターテスト
 *
 * @ignore
 */
import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as supertest from 'supertest';

import * as app from '../app/app';

describe('GET /oauth/token', () => {
    it('found', async () => {
        await supertest(app)
            .post('/oauth/token')
            .send({
                assertion: process.env.SSKTS_API_REFRESH_TOKEN,
                scope: 'admin'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                assert(typeof response.body.access_token === 'string');
                assert(typeof response.body.token_type === 'string');
                assert(Number.isInteger(response.body.expires_in));
            });
    });

    it('invalid assertion', async () => {
        await supertest(app)
            .post('/oauth/token')
            .send({
                assertion: 'assertion',
                scope: 'admin'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert.equal(response.body.errors[0].detail, 'invalid assertion');
            });
    });

    it('invalid scope', async () => {
        await supertest(app)
            .post('/oauth/token')
            .send({
                assertion: process.env.SSKTS_API_REFRESH_TOKEN,
                scope: '*****'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert.equal(response.body.errors[0].detail, 'invalid scope');
            });
    });
});
