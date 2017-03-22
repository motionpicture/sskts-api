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
describe('POST /transactions/:id/authorizations/mvtk', () => {
    it('addMvtkAuthorization ok', () => __awaiter(this, void 0, void 0, function* () {
        // テストデータ作成
        const owner1 = sskts.factory.owner.anonymous.create({});
        const owner2 = sskts.factory.owner.anonymous.create({});
        const transaction = sskts.factory.transaction.create({
            status: sskts.factory.transactionStatus.UNDERWAY,
            owners: [owner1, owner2],
            expires_at: new Date()
        });
        const ownerAdapter = sskts.adapter.owner(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
        yield ownerAdapter.model.findByIdAndUpdate(owner1.id, owner1, { new: true, upsert: true }).exec();
        yield ownerAdapter.model.findByIdAndUpdate(owner2.id, owner2, { new: true, upsert: true }).exec();
        const update = Object.assign(transaction, { owners: [owner1.id, owner2.id] });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(update.id, update, { new: true, upsert: true }).exec();
        let authorizationId = '';
        yield supertest(app)
            .post('/transactions/' + transaction.id + '/authorizations/mvtk')
            .set('authorization', 'Bearer ' + process.env.SSKTS_API_ACCESS_TOKEN)
            .set('Accept', 'application/json')
            .send({
            owner_from: owner1.id,
            owner_to: owner2.id,
            price: 999,
            kgygish_cd: 'SSK000',
            yyk_dvc_typ: '00',
            trksh_flg: '0',
            kgygish_sstm_zskyyk_no: '118124',
            kgygish_usr_zskyyk_no: '124',
            jei_dt: '2017/03/0210: 00: 00',
            kij_ymd: '2017/03/02',
            st_cd: '15',
            scren_cd: '1',
            knyknr_no_info: [
                {
                    knyknr_no: '4450899842',
                    pin_cd: '7648',
                    knsh_info: [
                        { knsh_typ: '01', mi_num: '2' }
                    ]
                }
            ],
            zsk_info: [
                { zsk_cd: 'Ａ－２' },
                { zsk_cd: 'Ａ－３' }
            ],
            skhn_cd: '1622700'
        })
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            assert.equal(response.body.data.type, 'authorizations');
            authorizationId = response.body.data.id;
        });
        // 取引イベントからオーソリIDで検索して、取引IDの一致を確認
        const transactionEvent = yield transactionAdapter.transactionEventModel.findOne({
            'authorization.id': authorizationId
        }).exec();
        assert.equal(transactionEvent.get('transaction'), transaction.id);
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(owner1.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(owner2.id).exec();
    }));
    it('addMvtkAuthorization BAD_REQUEST', () => __awaiter(this, void 0, void 0, function* () {
        // テストデータ作成
        const owner1 = sskts.factory.owner.anonymous.create({});
        const owner2 = sskts.factory.owner.anonymous.create({});
        const transaction = sskts.factory.transaction.create({
            status: sskts.factory.transactionStatus.UNDERWAY,
            owners: [owner1, owner2],
            expires_at: new Date()
        });
        const ownerAdapter = sskts.adapter.owner(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
        yield ownerAdapter.model.findByIdAndUpdate(owner1.id, owner1, { new: true, upsert: true }).exec();
        yield ownerAdapter.model.findByIdAndUpdate(owner2.id, owner2, { new: true, upsert: true }).exec();
        const update = Object.assign(transaction, { owners: [owner1.id, owner2.id] });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(update.id, update, { new: true, upsert: true }).exec();
        yield supertest(app)
            .post('/transactions/' + transaction.id + '/authorizations/mvtk')
            .set('authorization', 'Bearer ' + process.env.SSKTS_API_ACCESS_TOKEN)
            .set('Accept', 'application/json')
            .send({
            owner_from: 'xxx',
            owner_to: 'xxx',
            price: 999,
            kgygish_cd: 'SSK000',
            yyk_dvc_typ: '00',
            trksh_flg: '0',
            kgygish_sstm_zskyyk_no: '118124',
            kgygish_usr_zskyyk_no: '124',
            jei_dt: '2017/03/0210: 00: 00',
            kij_ymd: '2017/03/02',
            st_cd: '15',
            scren_cd: '1',
            knyknr_no_info: [
                {
                    knyknr_no: '4450899842',
                    pin_cd: '7648',
                    knsh_info: [
                        { knsh_typ: '01', mi_num: '2' }
                    ]
                }
            ],
            zsk_info: [
                { zsk_cd: 'Ａ－２' },
                { zsk_cd: 'Ａ－３' }
            ],
            skhn_cd: '1622700'
        })
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
        });
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(owner1.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(owner2.id).exec();
    }));
});
