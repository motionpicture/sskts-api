"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * oauthルーターテスト
 *
 * @ignore
 */
const assert = require("assert");
const HTTPStatus = require("http-status");
const supertest = require("supertest");
const app = require("../app/app");
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
    it('invalid assertion', (done) => {
        supertest(app)
            .post('/oauth/token')
            .send({
            assertion: 'assertion',
            scope: 'admin'
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(HTTPStatus.BAD_REQUEST)
            .then((response) => {
            assert.equal(response.body.errors[0].description, 'invalid assertion');
            done();
        }).catch((err) => {
            done(err);
        });
    });
    it('invalid scope', (done) => {
        supertest(app)
            .post('/oauth/token')
            .send({
            assertion: process.env.SSKTS_API_REFRESH_TOKEN,
            scope: '*****'
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(HTTPStatus.BAD_REQUEST)
            .then((response) => {
            assert.equal(response.body.errors[0].description, 'invalid scope');
            done();
        }).catch((err) => {
            done(err);
        });
    });
});
