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
const moment = require("moment");
const supertest = require("supertest");
const app = require("../../app/app");
const Resources = require("../resources");
const OAuthScenario = require("../scenarios/oauth");
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = sskts.mongoose.createConnection(process.env.MONGOLAB_URI);
    // 全て削除してからテスト開始
    const screenAdapter = sskts.adapter.screen(connection);
    yield screenAdapter.model.remove({}).exec();
}));
describe('GET /screens/:id', () => {
    it('アクセストークン必須', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/screens/0000000000')
            .expect(httpStatus.UNAUTHORIZED);
    }));
    it('not found', () => __awaiter(this, void 0, void 0, function* () {
        const accessToken = yield OAuthScenario.loginAsAdmin();
        yield supertest(app)
            .get('/screens/0000000000')
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
        yield Resources.importMasters(moment().add(1, 'days').toDate());
        const screenAdapter = sskts.adapter.screen(connection);
        const screenDoc = yield screenAdapter.model.findOne().exec();
        if (screenDoc === null) {
            throw new Error('test data not imported');
        }
        const accessToken = yield OAuthScenario.loginAsAdmin();
        yield supertest(app)
            .get(`/screens/${screenDoc.get('id')}`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            assert.equal(response.body.data.type, 'screens');
            assert.equal(response.body.data.id, screenDoc.get('id'));
        });
    }));
});
