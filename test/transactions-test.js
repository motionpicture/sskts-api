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
 * transactionルーターテスト
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
before(() => __awaiter(this, void 0, void 0, function* () {
    // 全て削除してからテスト開始
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    const transactionAdapter = sskts.adapter.transaction(connection);
    yield transactionAdapter.transactionModel.remove({}).exec();
}));
describe('GET /transactions/:id', () => {
    it('transaction not found', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/transactions/58cb2e2276cee91fe4387dd1')
            .set('authorization', 'Bearer ' + process.env.SSKTS_API_ACCESS_TOKEN)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.NOT_FOUND)
            .then((response) => {
            assert.equal(response.body.data, null);
        });
    }));
    it('transaction found', () => __awaiter(this, void 0, void 0, function* () {
        // テストデータ作成
        const transaction = sskts.factory.transaction.create({
            status: sskts.factory.transactionStatus.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });
        const transactionAdapter = sskts.adapter.transaction(connection);
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { upsert: true }).exec();
        yield supertest(app)
            .get('/transactions/' + transaction.id)
            .set('authorization', 'Bearer ' + process.env.SSKTS_API_ACCESS_TOKEN)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            assert.equal(response.body.data.type, 'transactions');
            assert.equal(response.body.data.id, transaction.id);
            assert.equal(response.body.data.attributes.id, transaction.id);
        });
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    }));
});
describe('POST /transactions/startIfPossible', () => {
    it('startIfPossible not found', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/transactions/startIfPossible')
            .set('authorization', 'Bearer ' + process.env.SSKTS_API_ACCESS_TOKEN)
            .set('Accept', 'application/json')
            .send({
            expires_at: Date.now()
        })
            .expect('Content-Type', /json/)
            .expect(httpStatus.NOT_FOUND)
            .then((response) => {
            assert.equal(response.body.data, null);
        });
    }));
    it('startIfPossible found', () => __awaiter(this, void 0, void 0, function* () {
        // テストデータ作成
        const transaction = sskts.factory.transaction.create({
            status: sskts.factory.transactionStatus.READY,
            owners: [],
            expires_at: moment().add(10, 'seconds').toDate() // tslint:disable-line:no-magic-numbers
        });
        const transactionAdapter = sskts.adapter.transaction(connection);
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { upsert: true }).exec();
        yield supertest(app)
            .post('/transactions/startIfPossible')
            .set('authorization', 'Bearer ' + process.env.SSKTS_API_ACCESS_TOKEN)
            .set('Accept', 'application/json')
            .send({
            expires_at: Date.now()
        })
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            assert.equal(response.body.data.type, 'transactions');
            assert.equal(response.body.data.id, transaction.id);
            assert.equal(response.body.data.attributes.id, transaction.id);
        });
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    }));
});
