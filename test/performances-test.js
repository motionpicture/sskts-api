"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * performancesルーターテスト
 *
 * @ignore
 */
const sskts = require("@motionpicture/sskts-domain");
const assert = require("assert");
const httpStatus = require("http-status");
const moment = require("moment");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app/app");
let connection;
const TEST_THEATER_ID = '118';
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
}));
describe('パフォーマンス検索', () => {
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/performances')
            .query({
            theater: TEST_THEATER_ID,
            day: moment().format('YYYYMMDD')
        })
            .set('authorization', `Bearer ${process.env.SSKTS_API_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            assert(Array.isArray(response.body.data));
        });
    }));
    it('検索条件に劇場が足りない', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/performances')
            .query({
            day: moment().format('YYYYMMDD')
        })
            .set('authorization', `Bearer ${process.env.SSKTS_API_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
            assert.equal(response.body.errors[0].source.parameter, 'theater');
        });
    }));
});
describe('GET /performances/:id', () => {
    before(() => __awaiter(this, void 0, void 0, function* () {
        // 全て削除してからテスト開始
        const performanceAdapter = sskts.adapter.performance(connection);
        yield performanceAdapter.model.remove({}).exec();
    }));
    it('not found', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/performances/0000000000')
            .set('authorization', `Bearer ${process.env.SSKTS_API_ACCESS_TOKEN}`)
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
        const filmAdapter = sskts.adapter.film(connection);
        const screenAdapter = sskts.adapter.screen(connection);
        const performanceAdapter = sskts.adapter.performance(connection);
        yield sskts.service.master.importTheater(TEST_THEATER_ID)(theaterAdapter);
        yield sskts.service.master.importScreens(TEST_THEATER_ID)(theaterAdapter, screenAdapter);
        yield sskts.service.master.importFilms(TEST_THEATER_ID)(theaterAdapter, filmAdapter);
        yield sskts.service.master.importPerformances(TEST_THEATER_ID, '20170301', '20170303')(filmAdapter, screenAdapter, performanceAdapter);
        const performanceDoc = yield performanceAdapter.model.findOne().exec();
        yield supertest(app)
            .get(`/performances/${performanceDoc.get('id')}`)
            .set('authorization', `Bearer ${process.env.SSKTS_API_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            assert.equal(response.body.data.type, 'performances');
            assert.equal(response.body.data.id, performanceDoc.get('id'));
            assert.equal(response.body.data.attributes.id, performanceDoc.get('id'));
        });
    }));
});
