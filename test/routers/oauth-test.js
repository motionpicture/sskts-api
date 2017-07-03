"use strict";
/**
 * oauthルーターテスト
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
const sskts = require("@motionpicture/sskts-domain");
const assert = require("assert");
const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../../app/app");
let TEST_CLIENT_ID;
let TEST_USERNAME;
const TEST_PASSWORD = 'password';
let TEST_BODY_CLIENT_CREDENTIALS;
let TEST_BODY_PASSWORD;
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    TEST_CLIENT_ID = `sskts-api:test:oauth${Date.now().toString()}`;
    TEST_BODY_CLIENT_CREDENTIALS = {
        grant_type: 'client_credentials',
        scopes: ['test'],
        client_id: TEST_CLIENT_ID,
        state: 'test'
    };
    TEST_USERNAME = `sskts-api:test:oauth${Date.now().toString()}`;
    TEST_BODY_PASSWORD = {
        grant_type: 'password',
        scopes: ['test'],
        username: TEST_USERNAME,
        password: TEST_PASSWORD
    };
}));
describe('認可タイプに共通の仕様', () => {
    it('非対応の認可タイプならBAD_REQUEST', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/oauth/token')
            .send({
            grant_type: 'invalidgranttype',
            scopes: ['test']
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
        });
    }));
});
describe('POST /oauth/token', () => {
    it('found', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/oauth/token')
            .send({
            assertion: process.env.SSKTS_API_REFRESH_TOKEN,
            scope: 'admin'
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            assert(typeof response.body.access_token === 'string');
            assert(typeof response.body.token_type === 'string');
            assert(Number.isInteger(response.body.expires_in));
        });
    }));
    it('invalid assertion', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/oauth/token')
            .send({
            assertion: 'assertion',
            scope: 'admin'
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
        });
    }));
    it('スコープがadminでなければBAD_REQUEST', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/oauth/token')
            .send({
            assertion: process.env.SSKTS_API_REFRESH_TOKEN,
            scope: '*****'
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
        });
    }));
});
describe('クライアント情報認可', () => {
    it('スコープ不足ならBAD_REQUEST', () => __awaiter(this, void 0, void 0, function* () {
        const data = Object.assign({}, TEST_BODY_CLIENT_CREDENTIALS, { scopes: undefined });
        yield supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
        });
    }));
    it('クライアントID不足ならBAD_REQUEST', () => __awaiter(this, void 0, void 0, function* () {
        const data = Object.assign({}, TEST_BODY_CLIENT_CREDENTIALS, { client_id: undefined });
        yield supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
        });
    }));
    it('ステート不足ならBAD_REQUEST', () => __awaiter(this, void 0, void 0, function* () {
        const data = Object.assign({}, TEST_BODY_CLIENT_CREDENTIALS, { state: undefined });
        yield supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
        });
    }));
    it('クライアント存在しなければBAD_REQUEST', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/oauth/token')
            .send(TEST_BODY_CLIENT_CREDENTIALS)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
        });
    }));
    it('資格情報取得成功', () => __awaiter(this, void 0, void 0, function* () {
        // テストクライアント作成
        const client = sskts.factory.client.create({
            id: TEST_CLIENT_ID,
            secret_hash: 'test',
            name: { en: '', ja: '' },
            description: { en: '', ja: '' },
            notes: { en: '', ja: '' },
            email: process.env.SSKTS_DEVELOPER_EMAIL
        });
        const clientAdapter = sskts.adapter.client(connection);
        yield clientAdapter.clientModel.findByIdAndUpdate(client.id, client, { new: true, upsert: true }).exec();
        const credentials = yield supertest(app)
            .post('/oauth/token')
            .send(TEST_BODY_CLIENT_CREDENTIALS)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => response.body);
        assert(typeof credentials.access_token, 'string');
        assert(typeof credentials.token_type, 'string');
        assert(typeof credentials.expires_in, 'number');
        // アクセストークンに適切にデータが含まれているはず
        const payload = yield new Promise((resolve, reject) => {
            jwt.verify(credentials.access_token, process.env.SSKTS_API_SECRET, {}, (err, decoded) => {
                if (err instanceof Error) {
                    reject(err);
                }
                else {
                    resolve(decoded);
                }
            });
        });
        assert.equal(payload.client, TEST_BODY_CLIENT_CREDENTIALS.client_id);
        assert.equal(payload.state, TEST_BODY_CLIENT_CREDENTIALS.state);
        assert.deepEqual(payload.scopes, TEST_BODY_CLIENT_CREDENTIALS.scopes);
        // テストクライアント削除
        yield clientAdapter.clientModel.findByIdAndRemove(client.id).exec();
    }));
});
describe('パスワード認可', () => {
    it('スコープ不足ならBAD_REQUEST', () => __awaiter(this, void 0, void 0, function* () {
        const data = Object.assign({}, TEST_BODY_PASSWORD, { scopes: undefined });
        yield supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
        });
    }));
    it('ユーザーネーム不足ならBAD_REQUEST', () => __awaiter(this, void 0, void 0, function* () {
        const data = Object.assign({}, TEST_BODY_PASSWORD, { username: undefined });
        yield supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
        });
    }));
    it('パスワード不足ならBAD_REQUEST', () => __awaiter(this, void 0, void 0, function* () {
        const data = Object.assign({}, TEST_BODY_PASSWORD, { password: undefined });
        yield supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
        });
    }));
    it('会員存在しなければBAD_REQUEST', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/oauth/token')
            .send(TEST_BODY_PASSWORD)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
        });
    }));
    it('パスワードが間違っていればBAD_REQUEST', () => __awaiter(this, void 0, void 0, function* () {
        // テスト会員作成
        const memberOwner = yield sskts.factory.owner.member.create({
            username: TEST_USERNAME,
            password: TEST_PASSWORD,
            name_first: 'xxx',
            name_last: 'xxx',
            email: process.env.SSKTS_DEVELOPER_EMAIL
        });
        const ownerAdapter = sskts.adapter.owner(connection);
        yield sskts.service.member.signUp(memberOwner)(ownerAdapter);
        const data = Object.assign({}, TEST_BODY_PASSWORD, { password: `${TEST_BODY_PASSWORD.password}x` });
        yield supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
        });
        // テストクライアント削除
        yield ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    }));
    it('資格情報取得成功', () => __awaiter(this, void 0, void 0, function* () {
        // テスト会員作成
        const memberOwner = yield sskts.factory.owner.member.create({
            username: TEST_USERNAME,
            password: TEST_PASSWORD,
            name_first: 'xxx',
            name_last: 'xxx',
            email: process.env.SSKTS_DEVELOPER_EMAIL
        });
        const ownerAdapter = sskts.adapter.owner(connection);
        yield sskts.service.member.signUp(memberOwner)(ownerAdapter);
        const credentials = yield supertest(app)
            .post('/oauth/token')
            .send(TEST_BODY_PASSWORD)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => response.body);
        assert(typeof credentials.access_token, 'string');
        assert(typeof credentials.token_type, 'string');
        assert(typeof credentials.expires_in, 'number');
        // アクセストークンに適切にデータが含まれているはず
        const payload = yield new Promise((resolve, reject) => {
            jwt.verify(credentials.access_token, process.env.SSKTS_API_SECRET, {}, (err, decoded) => {
                if (err instanceof Error) {
                    reject(err);
                }
                else {
                    resolve(decoded);
                }
            });
        });
        assert.equal(payload.owner, memberOwner.id);
        assert.deepEqual(payload.scopes, TEST_BODY_CLIENT_CREDENTIALS.scopes);
        // テストクライアント削除
        yield ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    }));
});
