"use strict";
/**
 * OAuthシナリオ
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
const sskts = require("@motionpicture/sskts-domain");
const httpStatus = require("http-status");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../../app/app");
exports.TEST_PASSWORD = 'password';
exports.TEST_CLIENT_ID = 'sskts-api:test:scenarios:oauth:';
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    // テストクライアント作成
    const client = sskts.factory.client.create({
        id: exports.TEST_CLIENT_ID,
        secret_hash: 'test',
        name: { en: '', ja: '' },
        description: { en: '', ja: '' },
        notes: { en: '', ja: '' },
        email: process.env.SSKTS_DEVELOPER_EMAIL
    });
    const clientAdapter = sskts.adapter.client(connection);
    yield clientAdapter.clientModel.findByIdAndUpdate(client.id, client, { upsert: true }).exec();
    // テスト会員新規登録
    exports.TEST_USERNAME = `sskts-api:test:scenarios:oauth:${Date.now().toString()}`;
    const memberOwner = yield sskts.factory.owner.member.create({
        username: exports.TEST_USERNAME,
        password: exports.TEST_PASSWORD,
        name_first: 'xxx',
        name_last: 'xxx',
        email: process.env.SSKTS_DEVELOPER_EMAIL
    });
    const ownerAdapter = sskts.adapter.owner(connection);
    yield sskts.service.member.signUp(memberOwner)(ownerAdapter);
    exports.TEST_OWNER_ID = memberOwner.id;
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
 * @param {string[]} scopes スコープリスト
 * @param {string} state 状態
 * @returns {Promise<string>} アクセストークン
 */
function loginAsClient(scopes, state) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield supertest(app)
            .post('/oauth/token')
            .send({
            grant_type: 'client_credentials',
            scopes: scopes,
            client_id: exports.TEST_CLIENT_ID,
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
 * @param {string[]} scopes スコープリスト
 * @returns {Promise<string>} アクセストークン
 */
function loginAsMember(scopes) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield supertest(app)
            .post('/oauth/token')
            .send({
            grant_type: 'password',
            scopes: scopes,
            username: exports.TEST_USERNAME,
            password: exports.TEST_PASSWORD
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => response.body.access_token);
    });
}
exports.loginAsMember = loginAsMember;
