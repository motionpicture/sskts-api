"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * filmsルーターテスト
 *
 * @ignore
 */
const assert = require("assert");
const HTTPStatus = require("http-status");
const supertest = require("supertest");
const app = require("../app/app");
describe('GET /films/:id', () => {
    it('found', (done) => {
        supertest(app)
            .get('/films/118161400')
            .set('authorization', 'Bearer ' + process.env.SSKTS_API_ACCESS_TOKEN)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(HTTPStatus.OK)
            .then((response) => {
            assert.equal(response.body.data.type, 'films');
            assert.equal(response.body.data.id, '118161400');
            assert.equal(response.body.data.attributes.id, '118161400');
            done();
        }).catch((err) => {
            done(err);
        });
    });
    it('not found', (done) => {
        supertest(app)
            .get('/films/0000000000')
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
