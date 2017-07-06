/**
 * devルーターテスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as supertest from 'supertest';

import * as app from '../../app/app';
import * as OAuthScenario from '../scenarios/oauth';

describe('/dev/500', () => {
    it('ok', async () => {
        const accessToken = await OAuthScenario.loginAsAdmin();

        await supertest(app)
            .get('/dev/500')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert(Array.isArray(response.body.errors));
            });
    });
});

describe('/dev/environmentVariables', () => {
    it('スコープ違反', async () => {
        const invalidAccessToken = await supertest(app)
            .post('/oauth/token')
            .send({
                assertion: process.env.SSKTS_API_REFRESH_TOKEN,
                scopes: ['invalidscope']
            })
            .then((response) => <string>response.body.access_token);

        await supertest(app)
            .get('/dev/environmentVariables')
            .set('authorization', `Bearer ${invalidAccessToken}`)
            .set('Accept', 'application/json')
            .expect(httpStatus.FORBIDDEN)
            .then((response) => {
                assert.equal(typeof response.text, 'string');
            });
    });

    it('ok', async () => {
        const accessToken = await OAuthScenario.loginAsAdmin();

        await supertest(app)
            .get('/dev/environmentVariables')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                assert.equal(typeof response.body.data, 'object');
            });
    });
});

describe('/dev/mongoose/connect', () => {
    it('ok', async () => {
        const accessToken = await OAuthScenario.loginAsAdmin();

        await supertest(app)
            .get('/dev/mongoose/connect')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect(httpStatus.NO_CONTENT);
    });
});
