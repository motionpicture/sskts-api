"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * theatersルーターテスト
 *
 * @ignore
 */
const assert = require("assert");
const httpStatus = require("http-status");
const supertest = require("supertest");
const app = require("../app/app");
describe('GET /theaters/:id', () => {
    it('found', (done) => {
        supertest(app)
            .get('/theaters/118')
            .set('authorization', 'Bearer ' + process.env.SSKTS_API_ACCESS_TOKEN)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            assert.equal(response.body.data.type, 'theaters');
            assert.equal(response.body.data.id, '118');
            assert.equal(response.body.data.attributes.id, '118');
            done();
        }).catch((err) => {
            done(err);
        });
    });
    it('not found', (done) => {
        supertest(app)
            .get('/theaters/0000000000')
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
