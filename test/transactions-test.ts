/**
 * transactionルーターテスト
 *
 * @ignore
 */
import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as supertest from 'supertest';

import * as app from '../app/app';

describe('GET /transaction/:id', () => {
    it('not found', (done) => {
        supertest(app)
            .get('/transaction/0000000000')
            .set('authorization', 'Bearer ' + process.env.SSKTS_API_ACCESS_TOKEN)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.NOT_FOUND)
            .then((response) => {
                assert.equal(response.body.data, null);
                done();
            }).catch((err) => {
                done(err);
            });
    });
});

