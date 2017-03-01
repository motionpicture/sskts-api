"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * screensルーターテスト
 *
 * @ignore
 */
const assert = require("assert");
const HTTPStatus = require("http-status");
const supertest = require("supertest");
const app = require("../app/app");
describe('GET /screens/:id', () => {
    it('found', (done) => {
        supertest(app)
            .get('/screens/1187')
            .set('authorization', 'Bearer ' + process.env.sskts_API_ACCESS_TOKEN)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(HTTPStatus.OK)
            .then((response) => {
            assert.equal(response.body.data.type, 'screens');
            assert.equal(response.body.data.id, '1187');
            assert.equal(response.body.data.attributes.id, '1187');
            done();
        }).catch((err) => {
            done(err);
        });
    });
    it('not found', (done) => {
        supertest(app)
            .get('/screens/0000000000')
            .set('authorization', 'Bearer ' + process.env.sskts_API_ACCESS_TOKEN)
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
