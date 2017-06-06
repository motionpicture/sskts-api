/**
 * devルーターテスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as supertest from 'supertest';

import * as app from '../app/app';

describe('/dev/500', () => {
    it('ok', async () => {
        await supertest(app)
            .get('/dev/500')
            .set('authorization', `Bearer ${process.env.SSKTS_API_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert(Array.isArray(response.body.errors));
            });
    });
});

describe('/dev/mongoose/connect', () => {
    it('ok', async () => {
        await supertest(app)
            .get('/dev/mongoose/connect')
            .set('authorization', `Bearer ${process.env.SSKTS_API_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .expect(httpStatus.NO_CONTENT)
            .then((response) => {
                assert.equal(response.text, '');
            });
    });
});
