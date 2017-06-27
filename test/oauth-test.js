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
const app = require("../app/app");
const OAuthController = require("../app/controllers/oauth");
const TEST_VALID_CLIENT_ID = 'testclientid';
const TEST_VALID_BODY_CLIENT_CREDENTIALS = {
    grant_type: 'client_credentials',
    scopes: ['test'],
    client_id: TEST_VALID_CLIENT_ID,
    state: 'test'
};
let TEST_USERNAME;
const TEST_PASSWORD = 'password';
let TEST_BODY_PASSWORD;
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    // 全クライアント削除
    const clientAdapter = sskts.adapter.client(connection);
    yield clientAdapter.clientModel.remove({}).exec();
    // 全会員削除
    const ownerAdapter = sskts.adapter.owner(connection);
    yield ownerAdapter.model.remove({ group: sskts.factory.ownerGroup.MEMBER }).exec();
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
            assert.equal(response.body.errors[0].title, 'Error');
            assert.equal(response.body.errors[0].detail, OAuthController.MESSAGE_UNIMPLEMENTED_GRANT_TYPE);
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
            assert.equal(response.body.errors[0].detail, OAuthController.MESSAGE_INVALID_ASSERTION);
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
            assert.equal(response.body.errors[0].source.parameter, 'scope');
        });
    }));
});
describe('クライアント情報認可', () => {
    it('スコープ不足ならBAD_REQUEST', () => __awaiter(this, void 0, void 0, function* () {
        const data = Object.assign({}, TEST_VALID_BODY_CLIENT_CREDENTIALS, { scopes: undefined });
        yield supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
            assert.equal(response.body.errors[0].source.parameter, 'scopes');
        });
    }));
    it('クライアントID不足ならBAD_REQUEST', () => __awaiter(this, void 0, void 0, function* () {
        const data = Object.assign({}, TEST_VALID_BODY_CLIENT_CREDENTIALS, { client_id: undefined });
        yield supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
            assert.equal(response.body.errors[0].source.parameter, 'client_id');
        });
    }));
    it('ステート不足ならBAD_REQUEST', () => __awaiter(this, void 0, void 0, function* () {
        const data = Object.assign({}, TEST_VALID_BODY_CLIENT_CREDENTIALS, { state: undefined });
        yield supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
            assert.equal(response.body.errors[0].source.parameter, 'state');
        });
    }));
    it('クライアント存在しなければBAD_REQUEST', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/oauth/token')
            .send(TEST_VALID_BODY_CLIENT_CREDENTIALS)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
            assert.equal(response.body.errors[0].detail, OAuthController.MESSAGE_CLIENT_NOT_FOUND);
        });
    }));
    it('資格情報取得成功', () => __awaiter(this, void 0, void 0, function* () {
        // テストクライアント作成
        const client = sskts.factory.client.create({
            id: TEST_VALID_CLIENT_ID,
            secret_hash: 'test',
            name: { en: '', ja: '' },
            description: { en: '', ja: '' },
            notes: { en: '', ja: '' },
            email: 'test@example.com'
        });
        const clientAdapter = sskts.adapter.client(connection);
        yield clientAdapter.clientModel.findByIdAndUpdate(client.id, client, { new: true, upsert: true }).exec();
        const credentials = yield supertest(app)
            .post('/oauth/token')
            .send(TEST_VALID_BODY_CLIENT_CREDENTIALS)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            return response.body;
        });
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
        assert.equal(payload.client.id, TEST_VALID_BODY_CLIENT_CREDENTIALS.client_id);
        assert.equal(payload.state, TEST_VALID_BODY_CLIENT_CREDENTIALS.state);
        assert.deepEqual(payload.scopes, TEST_VALID_BODY_CLIENT_CREDENTIALS.scopes);
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
            assert.equal(response.body.errors[0].source.parameter, 'scopes');
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
            assert.equal(response.body.errors[0].source.parameter, 'username');
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
            assert.equal(response.body.errors[0].source.parameter, 'password');
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
            assert.equal(response.body.errors[0].detail, OAuthController.MESSAGE_INVALID_USERNAME_OR_PASSWORD);
        });
    }));
    it('パスワードが間違っていればBAD_REQUEST', () => __awaiter(this, void 0, void 0, function* () {
        // テスト会員作成
        const memberOwner = yield sskts.factory.owner.member.create({
            username: TEST_USERNAME,
            password: TEST_PASSWORD,
            name_first: 'xxx',
            name_last: 'xxx',
            email: 'test@example.com'
        });
        const ownerAdapter = sskts.adapter.owner(connection);
        yield ownerAdapter.model.findByIdAndUpdate(memberOwner.id, memberOwner, { upsert: true }).exec();
        const data = Object.assign({}, TEST_BODY_PASSWORD, { password: `${TEST_BODY_PASSWORD.password}x` });
        yield supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
            assert.equal(response.body.errors[0].detail, OAuthController.MESSAGE_INVALID_USERNAME_OR_PASSWORD);
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
            email: 'test@example.com'
        });
        const ownerAdapter = sskts.adapter.owner(connection);
        yield ownerAdapter.model.findByIdAndUpdate(memberOwner.id, memberOwner, { upsert: true }).exec();
        const credentials = yield supertest(app)
            .post('/oauth/token')
            .send(TEST_BODY_PASSWORD)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            return response.body;
        });
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
        assert.equal(payload.owner.id, memberOwner.id);
        assert.equal(payload.owner.username, TEST_BODY_PASSWORD.username);
        assert.deepEqual(payload.scopes, TEST_VALID_BODY_CLIENT_CREDENTIALS.scopes);
        // テストクライアント削除
        yield ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    }));
});
