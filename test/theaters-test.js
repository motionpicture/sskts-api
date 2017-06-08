"use strict";
/**
 * theatersルーターテスト
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
const TEST_VALID_THEATER_ID = '118';
let connection;
let accessToken;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    accessToken = yield supertest(app)
        .post('/oauth/token')
        .send({
        assertion: process.env.SSKTS_API_REFRESH_TOKEN,
        scope: 'admin'
    })
        .then((response) => {
        return response.body.access_token;
    });
    // 全て削除してからテスト開始
    const theaterAdapter = sskts.adapter.theater(connection);
    yield theaterAdapter.model.remove({}).exec();
}));
describe('GET /theaters/:id', () => {
    it('アクセストークン必須', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/theaters/0000000000')
            .expect(httpStatus.UNAUTHORIZED)
            .then((response) => {
            assert.equal(response.text, 'Unauthorized');
        });
    }));
    it('not found', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/theaters/0000000000')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.NOT_FOUND)
            .then((response) => {
            assert.equal(response.body.data, null);
        });
    }));
    it('found', () => __awaiter(this, void 0, void 0, function* () {
        // テストデータインポート
        const theaterAdapter = sskts.adapter.theater(connection);
        yield sskts.service.master.importTheater(TEST_VALID_THEATER_ID)(theaterAdapter);
        const theaterDoc = yield theaterAdapter.model.findOne().exec();
        yield supertest(app)
            .get(`/theaters/${theaterDoc.get('id')}`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            assert.equal(response.body.data.type, 'theaters');
            assert.equal(response.body.data.id, theaterDoc.get('id'));
            assert.equal(response.body.data.attributes.id, theaterDoc.get('id'));
        });
    }));
});
describe('劇場検索', () => {
    before(() => __awaiter(this, void 0, void 0, function* () {
        // テストデータインポート
        const theaterAdapter = sskts.adapter.theater(connection);
        yield sskts.service.master.importTheater(TEST_VALID_THEATER_ID)(theaterAdapter);
    }));
    it('アクセストークン必須', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/theaters')
            .expect(httpStatus.UNAUTHORIZED)
            .then((response) => {
            assert.equal(response.text, 'Unauthorized');
        });
    }));
    it('レスポンスの型が適切', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/theaters')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            assert(Array.isArray(response.body.data));
            assert(response.body.data.length > 0);
            response.body.data.forEach((theater) => {
                assert.equal(theater.type, 'theaters');
            });
        });
    }));
});
