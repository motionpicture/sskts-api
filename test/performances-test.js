"use strict";
/**
 * performancesルーターテスト
 *
 * @ignore
 */
const assert = require("assert");
const HTTPStatus = require("http-status");
const supertest = require("supertest");
const app = require("../app/app");
describe('GET /performances/:id', () => {
    it('found', (done) => {
        supertest(app)
            .get('/performances/1182017011816140071850')
            .set('authorization', 'Bearer ' + process.env.SSKTS_API_ACCESS_TOKEN)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(HTTPStatus.OK)
            .then((response) => {
            assert.equal(response.body.data.type, 'performances');
            assert.equal(response.body.data.id, '1182017011816140071850');
            assert.equal(response.body.data.attributes.id, '1182017011816140071850');
            done();
        }).catch((err) => {
            done(err);
        });
    });
    it('not found', (done) => {
        supertest(app)
            .get('/performances/0000000000')
            .set('authorization', 'Bearer ' + process.env.SSKTS_API_ACCESS_TOKEN)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(HTTPStatus.NOT_FOUND)
            .then((response) => {
            assert.equal(response.body.data, null);
            done();
        }).catch((err) => {
            done(err);
        });
    });
});
