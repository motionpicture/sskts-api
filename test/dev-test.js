"use strict";
/**
 * devルーターテスト
 *
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const httpStatus = require("http-status");
const supertest = require("supertest");
const app = require("../app/app");
let accessToken;
before(() => __awaiter(this, void 0, void 0, function* () {
    accessToken = yield supertest(app)
        .post('/oauth/token')
        .send({
        assertion: process.env.SSKTS_API_REFRESH_TOKEN,
        scope: 'admin'
    })
        .then((response) => {
        return response.body.access_token;
    });
}));
describe('/dev/500', () => {
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/dev/500')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
        });
    }));
});
describe('/dev/mongoose/connect', () => {
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/dev/mongoose/connect')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect(httpStatus.NO_CONTENT)
            .then((response) => {
            assert.equal(response.text, '');
        });
    }));
});
