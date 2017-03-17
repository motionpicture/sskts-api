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
 * screensルーターテスト
 *
 * @ignore
 */
const sskts = require("@motionpicture/sskts-domain");
const assert = require("assert");
const httpStatus = require("http-status");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app/app");
let connection;
const theaterId = '118';
before(() => __awaiter(this, void 0, void 0, function* () {
    // 全て削除してからテスト開始
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    const screenAdapter = sskts.adapter.screen(connection);
    yield screenAdapter.model.remove({}).exec();
}));
describe('GET /screens/:id', () => {
    it('not found', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/screens/0000000000')
            .set('authorization', 'Bearer ' + process.env.SSKTS_API_ACCESS_TOKEN)
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
        const screenAdapter = sskts.adapter.screen(connection);
        yield sskts.service.master.importTheater(theaterId)(theaterAdapter);
        yield sskts.service.master.importScreens(theaterId)(theaterAdapter, screenAdapter);
        const screenDoc = yield screenAdapter.model.findOne().exec();
        yield supertest(app)
            .get('/screens/' + screenDoc.get('id'))
            .set('authorization', 'Bearer ' + process.env.SSKTS_API_ACCESS_TOKEN)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            assert.equal(response.body.data.type, 'screens');
            assert.equal(response.body.data.id, screenDoc.get('id'));
            assert.equal(response.body.data.attributes.id, screenDoc.get('id'));
        });
    }));
});
