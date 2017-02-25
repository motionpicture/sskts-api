"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * OAuth認証ヘルパー
 *
 * @ignore
 */
const supertest = require("supertest");
const app = require("../app/app");
before((done) => {
    supertest(app)
        .post('/oauth/token')
        .send({
        assertion: process.env.SSKTS_API_REFRESH_TOKEN,
        scope: 'admin'
    })
        .then((response) => {
        process.env.SSKTS_API_ACCESS_TOKEN = response.body.access_token;
        done();
    }).catch((err) => {
        done(err);
    });
});
