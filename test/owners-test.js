"use strict";
/**
 * 会員ルーターテスト
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
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app/app");
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    // 会員全て削除
    const ownerAdapter = sskts.adapter.owner(connection);
    yield ownerAdapter.model.remove({ group: sskts.factory.ownerGroup.MEMBER }).exec();
}));
describe('会員プロフィール取得', () => {
    let TEST_OWNER_ID;
    let TEST_USERNAME;
    const TEST_PASSWORD = 'password';
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // テスト会員作成
        const ownerAdapter = sskts.adapter.owner(connection);
        TEST_USERNAME = `sskts-api:test:owner-test:${Date.now().toString()}`;
        const memberOwner = yield sskts.factory.owner.member.create({
            username: TEST_USERNAME,
            password: TEST_PASSWORD,
            name_first: 'xxx',
            name_last: 'xxx',
            email: 'noreply@example.com'
        });
        yield ownerAdapter.model.findByIdAndUpdate(memberOwner.id, memberOwner, { upsert: true }).exec();
        TEST_OWNER_ID = memberOwner.id;
    }));
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        // テスト会員作成
        const ownerAdapter = sskts.adapter.owner(connection);
        yield ownerAdapter.model.findByIdAndRemove(TEST_OWNER_ID).exec();
    }));
    it('アクセストークン必須', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/owners/me')
            .set('Accept', 'application/json')
            .expect(httpStatus.UNAUTHORIZED)
            .then((response) => {
            assert.equal(response.text, 'Unauthorized');
        });
    }));
    it('会員ログイン必須', () => __awaiter(this, void 0, void 0, function* () {
        const accessToken = yield supertest(app)
            .post('/oauth/token')
            .send({
            assertion: process.env.SSKTS_API_REFRESH_TOKEN,
            scope: 'admin'
        })
            .then((response) => response.body.access_token);
        yield supertest(app)
            .get('/owners/me')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect(httpStatus.FORBIDDEN)
            .then((response) => {
            assert.equal(response.text, 'Forbidden');
        });
    }));
    it('会員としてログインすれば取得できる', () => __awaiter(this, void 0, void 0, function* () {
        const accessToken = yield supertest(app)
            .post('/oauth/token')
            .send({
            grant_type: 'password',
            username: TEST_USERNAME,
            password: TEST_PASSWORD,
            scopes: ['owners']
        })
            .then((response) => response.body.access_token);
        yield supertest(app)
            .get('/owners/me')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            assert.equal(response.body.data.type, 'owners');
            assert.equal(response.body.data.id, TEST_OWNER_ID);
            assert.equal(response.body.data.attributes.username, TEST_USERNAME);
        });
    }));
    it('万が一会員情報が消えた場合NotFound', () => __awaiter(this, void 0, void 0, function* () {
        const accessToken = yield supertest(app)
            .post('/oauth/token')
            .send({
            grant_type: 'password',
            username: TEST_USERNAME,
            password: TEST_PASSWORD,
            scopes: ['owners']
        })
            .then((response) => response.body.access_token);
        // テスト会員を強制的に削除
        const ownerAdapter = sskts.adapter.owner(connection);
        yield ownerAdapter.model.findByIdAndRemove(TEST_OWNER_ID).exec();
        yield supertest(app)
            .get('/owners/me')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.NOT_FOUND)
            .then((response) => {
            assert.equal(response.body.data, null);
        });
    }));
});
