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
const TEST_PASSWORD = 'password';
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
}));
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
function loginAsClient() {
    return __awaiter(this, void 0, void 0, function* () {
        const TEST_CLIENT_ID = 'sskts-api:test:scenarios:oauth:';
        // テストクライアント作成
        const client = sskts.factory.client.create({
            id: TEST_CLIENT_ID,
            secret_hash: 'test',
            name: { en: '', ja: '' },
            description: { en: '', ja: '' },
            notes: { en: '', ja: '' },
            email: 'test@example.com'
        });
        const clientAdapter = sskts.adapter.client(connection);
        yield clientAdapter.clientModel.findByIdAndUpdate(client.id, client, { upsert: true }).exec();
        return yield supertest(app)
            .post('/oauth/token')
            .send({
            grant_type: 'client_credentials',
            scopes: ['test'],
            client_id: TEST_CLIENT_ID,
            state: 'test'
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => response.body.access_token);
    });
}
exports.loginAsClient = loginAsClient;
function loginAsMember(scopes) {
    return __awaiter(this, void 0, void 0, function* () {
        const TEST_USERNAME = `sskts-api:test:scenarios:oauth:${Date.now().toString()}`;
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
        return yield supertest(app)
            .post('/oauth/token')
            .send({
            grant_type: 'password',
            scopes: scopes,
            username: TEST_USERNAME,
            password: TEST_PASSWORD
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => response.body.access_token);
    });
}
exports.loginAsMember = loginAsMember;
