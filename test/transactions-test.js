"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * transactionルーターテスト
 *
 * @ignore
 */
const assert = require("assert");
const httpStatus = require("http-status");
const supertest = require("supertest");
const app = require("../app/app");
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
