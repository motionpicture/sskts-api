"use strict";
/**
 * OAuthシナリオ
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
const httpStatus = require("http-status");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../../app/app");
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
}));
/**
 * 管理者としてログインする
 *
 * @export
 * @returns {Promise<string>} アクセストークン
 */
function loginAsAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield supertest(app)
            .post('/oauth/token')
            .send({
            assertion: process.env.SSKTS_API_REFRESH_TOKEN,
            scope: 'admin'
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => response.body.access_token);
    });
}
exports.loginAsAdmin = loginAsAdmin;
/**
 * クライアントとしてログインする
 *
 * @export
 * @param {string} clientId クライアントID
 * @param {string[]} scopes スコープリスト
 * @param {string} state 状態
 * @returns {Promise<string>} アクセストークン
 */
function loginAsClient(clientId, scopes, state) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield supertest(app)
            .post('/oauth/token')
            .send({
            grant_type: 'client_credentials',
            client_id: clientId,
            scopes: scopes,
            state: state
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => response.body.access_token);
    });
}
exports.loginAsClient = loginAsClient;
/**
 * 会員としてログインする
 *
 * @export
 * @param {string} username ユーザーネーム
 * @param {string} password パスワード
 * @param {string[]} scopes スコープリスト
 * @returns {Promise<string>} アクセストークン
 */
function loginAsMember(username, password, scopes) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield supertest(app)
            .post('/oauth/token')
            .send({
            grant_type: 'password',
            scopes: scopes,
            username: username,
            password: password
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => response.body.access_token);
    });
}
exports.loginAsMember = loginAsMember;
