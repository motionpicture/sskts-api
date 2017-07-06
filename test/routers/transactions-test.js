"use strict";
/**
 * transactionルーターテスト
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
const supertest = require("supertest");
const app = require("../../app/app");
const Resources = require("../resources");
const OAuthScenario = require("../scenarios/oauth");
const TransactionScenario = require("../scenarios/transaction");
const TEST_TRANSACTIONS_COUNT_UNIT_IN_SECONDS = 60;
const TEST_NUMBER_OF_TRANSACTIONS_PER_UNIT = 120;
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = sskts.mongoose.createConnection(process.env.MONGOLAB_URI);
    // 全て削除してからテスト開始
    const transactionAdapter = sskts.adapter.transaction(connection);
    yield transactionAdapter.transactionModel.remove({}).exec();
}));
describe('GET /transactions/:id', () => {
    it('取引存在しない', () => __awaiter(this, void 0, void 0, function* () {
        const accessToken = yield OAuthScenario.loginAsAdmin();
        yield supertest(app)
            .get('/transactions/58cb2e2276cee91fe4387dd1')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.NOT_FOUND)
            .then((response) => {
            assert.equal(response.body.data, null);
        });
    }));
    it('取引存在する', () => __awaiter(this, void 0, void 0, function* () {
        // テストデータ作成
        const transaction = sskts.factory.transaction.create({
            status: sskts.factory.transactionStatus.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });
        const transactionAdapter = sskts.adapter.transaction(connection);
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { upsert: true }).exec();
        const accessToken = yield OAuthScenario.loginAsAdmin();
        yield supertest(app)
            .get(`/transactions/${transaction.id}`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            assert.equal(response.body.data.type, 'transactions');
            assert.equal(response.body.data.id, transaction.id);
        });
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    }));
});
describe('取引開始', () => {
    let client;
    let memberOwner;
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        process.env.TRANSACTIONS_COUNT_UNIT_IN_SECONDS = TEST_TRANSACTIONS_COUNT_UNIT_IN_SECONDS;
        process.env.NUMBER_OF_TRANSACTIONS_PER_UNIT = TEST_NUMBER_OF_TRANSACTIONS_PER_UNIT;
        client = yield Resources.createClient();
        // テスト会員作成
        memberOwner = yield Resources.createMemberOwner();
    }));
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        // テストクライアント削除
        const clientAdapter = sskts.adapter.client(connection);
        yield clientAdapter.clientModel.findByIdAndRemove(client.id).exec();
        // テスト会員削除
        const ownerAdapter = sskts.adapter.owner(connection);
        yield ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    }));
    it('環境変数不足だとエラー', () => __awaiter(this, void 0, void 0, function* () {
        delete process.env.TRANSACTIONS_COUNT_UNIT_IN_SECONDS;
        delete process.env.NUMBER_OF_TRANSACTIONS_PER_UNIT;
        const accessToken = yield OAuthScenario.loginAsAdmin();
        yield supertest(app)
            .post('/transactions/startIfPossible')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({
            expires_at: Date.now()
        })
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert(Array.isArray(response.body.errors));
        });
    }));
    it('取引数制限が0なら開始できない', () => __awaiter(this, void 0, void 0, function* () {
        process.env.NUMBER_OF_TRANSACTIONS_PER_UNIT = 0;
        const accessToken = yield OAuthScenario.loginAsAdmin();
        yield supertest(app)
            .post('/transactions/startIfPossible')
            .set('authorization', `Bearer ${accessToken}`)
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
    it('スコープ不足で開始できない', () => __awaiter(this, void 0, void 0, function* () {
        const accessToken = yield OAuthScenario.loginAsMember(client.id, 'test', memberOwner.username, memberOwner.password, ['xxx']);
        yield supertest(app)
            .post('/transactions/startIfPossible')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({
            expires_at: Date.now()
        })
            .expect(httpStatus.FORBIDDEN)
            .then((response) => {
            assert.equal(typeof response.text, 'string');
        });
    }));
    it('匿名所有者として開始できる', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = sskts.adapter.transaction(connection);
        const accessToken = yield OAuthScenario.loginAsAdmin();
        const transactionId = yield supertest(app)
            .post('/transactions/startIfPossible')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({
            expires_at: Date.now()
        })
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            assert.equal(response.body.data.type, 'transactions');
            assert.equal(typeof response.body.data.id, 'string');
            return response.body.data.id;
        });
        yield transactionAdapter.transactionModel.findByIdAndRemove(transactionId).exec();
    }));
    it('会員所有者として開始できる', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = sskts.adapter.transaction(connection);
        const accessToken = yield OAuthScenario.loginAsMember(client.id, 'test', memberOwner.username, memberOwner.password, ['transactions']);
        const transactionId = yield supertest(app)
            .post('/transactions/startIfPossible')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({
            expires_at: Date.now()
        })
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            assert.equal(response.body.data.type, 'transactions');
            assert.equal(typeof response.body.data.id, 'string');
            return response.body.data.id;
        });
        // 取引中の所有者が会員であることを確認
        const transactionOption = yield sskts.service.transactionWithId.findById(transactionId)(transactionAdapter);
        assert(transactionOption.isDefined);
        assert.equal(transactionOption.get().status, sskts.factory.transactionStatus.UNDERWAY);
        const memberOwnerInTransaction = transactionOption.get().owners.find((owner) => owner.id === memberOwner.id);
        assert(memberOwnerInTransaction !== undefined);
        // テスト取引削除
        yield transactionAdapter.transactionModel.findByIdAndRemove(transactionId).exec();
    }));
});
describe('POST /transactions/:id/authorizations/mvtk', () => {
    it('ムビチケ承認追加できる', () => __awaiter(this, void 0, void 0, function* () {
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
        const update = Object.assign({}, transaction, { owners: [owner1.id, owner2.id] });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(update.id, update, { new: true, upsert: true }).exec();
        const accessToken = yield OAuthScenario.loginAsAdmin();
        const authorizationId = yield supertest(app)
            .post(`/transactions/${transaction.id}/authorizations/mvtk`)
            .set('authorization', `Bearer ${accessToken}`)
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
            return response.body.data.id;
        });
        // 取引イベントからオーソリIDで検索して、取引IDの一致を確認
        const transactionEvent = yield transactionAdapter.transactionEventModel.findOne({ 'authorization.id': authorizationId }).exec();
        if (transactionEvent === null) {
            throw new Error('transactionEvent should exist');
        }
        assert.equal(transactionEvent.get('transaction'), transaction.id);
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(owner1.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(owner2.id).exec();
    }));
    it('scren_cdパラメータ不足でムビチケ承認追加失敗', () => __awaiter(this, void 0, void 0, function* () {
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
        const update = Object.assign({}, transaction, { owners: [owner1.id, owner2.id] });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(update.id, update, { new: true, upsert: true }).exec();
        const accessToken = yield OAuthScenario.loginAsAdmin();
        yield supertest(app)
            .post(`/transactions/${transaction.id}/authorizations/mvtk`)
            .set('authorization', `Bearer ${accessToken}`)
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
            // scren_cd: '1',
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
describe('座席予約承認追加', () => {
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        // 進行中の取引データを作成
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
        const update = Object.assign({}, transaction, { owners: [owner1.id, owner2.id] });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(update.id, update, { new: true, upsert: true }).exec();
        const accessToken = yield OAuthScenario.loginAsAdmin();
        const authorizationId = yield supertest(app)
            .post(`/transactions/${transaction.id}/authorizations/coaSeatReservation`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({
            price: 4400,
            owner_from: owner1.id,
            owner_to: owner2.id,
            coa_tmp_reserve_num: '11895',
            coa_theater_code: '001',
            coa_date_jouei: '20170210',
            coa_title_code: '8513',
            coa_title_branch_num: '0',
            coa_time_begin: '1010',
            coa_screen_code: '2',
            seats: [
                {
                    price: 2200,
                    authorizations: [],
                    performance: '001201701208513021010',
                    screen_section: '000',
                    seat_code: 'Ｉ－１０',
                    ticket_code: '14',
                    ticket_name: {
                        ja: '一般3D(ﾒｶﾞﾈ込)',
                        en: ' '
                    },
                    ticket_name_kana: '',
                    std_price: 2200,
                    add_price: 0,
                    dis_price: 0,
                    sale_price: 2200,
                    mvtk_app_price: 0,
                    add_glasses: 0,
                    kbn_eisyahousiki: '00',
                    mvtk_num: '',
                    mvtk_kbn_denshiken: '00',
                    mvtk_kbn_maeuriken: '00',
                    mvtk_kbn_kensyu: '00',
                    mvtk_sales_price: 0
                }
            ]
        })
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            assert.equal(response.body.data.type, 'authorizations');
            return response.body.data.id;
        });
        // 取引イベントからオーソリIDで検索して、取引IDの一致を確認
        const transactionEvent = yield transactionAdapter.transactionEventModel.findOne({ 'authorization.id': authorizationId }).exec();
        if (transactionEvent === null) {
            throw new Error('transactionEvent should exist');
        }
        assert.equal(transactionEvent.get('transaction'), transaction.id);
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(owner1.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(owner2.id).exec();
    }));
    it('coa_screen_codeパラメータ不足で失敗', () => __awaiter(this, void 0, void 0, function* () {
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
        const update = Object.assign({}, transaction, { owners: [owner1.id, owner2.id] });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(update.id, update, { new: true, upsert: true }).exec();
        const accessToken = yield OAuthScenario.loginAsAdmin();
        yield supertest(app)
            .post(`/transactions/${transaction.id}/authorizations/coaSeatReservation`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({
            price: 4400,
            owner_from: owner1.id,
            owner_to: owner2.id,
            coa_tmp_reserve_num: '11895',
            coa_theater_code: '001',
            coa_date_jouei: '20170210',
            coa_title_code: '8513',
            coa_title_branch_num: '0',
            coa_time_begin: '1010',
            seats: [
                {
                    price: 2200,
                    authorizations: [],
                    performance: '001201701208513021010',
                    section: '000',
                    seat_code: 'Ｉ－１０',
                    ticket_code: '14',
                    ticket_name: {
                        ja: '一般3D(ﾒｶﾞﾈ込)',
                        en: ' '
                    },
                    ticket_name_kana: '',
                    std_price: 2200,
                    add_price: 0,
                    dis_price: 0,
                    sale_price: 2200,
                    mvtk_app_price: 0,
                    add_glasses: 0,
                    kbn_eisyahousiki: '00',
                    mvtk_num: '',
                    mvtk_kbn_denshiken: '00',
                    mvtk_kbn_maeuriken: '00',
                    mvtk_kbn_kensyu: '00',
                    mvtk_sales_price: 0
                }
            ]
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
describe('取引中に匿名所有者更新', () => {
    let TEST_ACCESS_TOKEN;
    let TEST_TRANSACTION_ID;
    let TEST_OWNER_ID;
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // 匿名で取引開始
        TEST_ACCESS_TOKEN = yield OAuthScenario.loginAsAdmin();
        const startTransactionResult = yield TransactionScenario.start(TEST_ACCESS_TOKEN);
        TEST_TRANSACTION_ID = startTransactionResult.transactionId;
        TEST_OWNER_ID = startTransactionResult.ownerId;
    }));
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = sskts.adapter.owner(sskts.mongoose.connection);
        const transactionAdapter = sskts.adapter.transaction(sskts.mongoose.connection);
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: TEST_TRANSACTION_ID }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(TEST_TRANSACTION_ID).exec();
        yield ownerAdapter.model.findByIdAndRemove(TEST_OWNER_ID).exec();
    }));
    it('更新できる', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = sskts.adapter.owner(sskts.mongoose.connection);
        const now = Date.now().toString();
        const profile = {
            name_first: `first name${now}`,
            name_last: `last name${now}`,
            tel: `090${now}`,
            email: `${now}${process.env.SSKTS_DEVELOPER_EMAIL}`
        };
        yield supertest(app)
            .patch(`/transactions/${TEST_TRANSACTION_ID}/anonymousOwner`)
            .set('authorization', `Bearer ${TEST_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .send(profile)
            .expect(httpStatus.NO_CONTENT);
        // プロフィール更新されているかどうか確認
        const ownerDoc = yield ownerAdapter.model.findById(TEST_OWNER_ID).exec();
        assert.equal(ownerDoc.get('name_first'), profile.name_first);
        assert.equal(ownerDoc.get('name_last'), profile.name_last);
        assert.equal(ownerDoc.get('tel'), profile.tel);
        assert.equal(ownerDoc.get('email'), profile.email);
    }));
});
describe('取引中に所有者置換', () => {
    let TEST_ACCESS_TOKEN;
    let TEST_TRANSACTION_ID;
    let TEST_OWNER_ID;
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // 匿名で取引開始
        TEST_ACCESS_TOKEN = yield OAuthScenario.loginAsAdmin();
        const startTransactionResult = yield TransactionScenario.start(TEST_ACCESS_TOKEN);
        TEST_TRANSACTION_ID = startTransactionResult.transactionId;
        TEST_OWNER_ID = startTransactionResult.ownerId;
    }));
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = sskts.adapter.owner(sskts.mongoose.connection);
        const transactionAdapter = sskts.adapter.transaction(sskts.mongoose.connection);
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: TEST_TRANSACTION_ID }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(TEST_TRANSACTION_ID).exec();
        yield ownerAdapter.model.findByIdAndRemove(TEST_OWNER_ID).exec();
    }));
    it('匿名所有者から匿名所有者にできる', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = sskts.adapter.owner(sskts.mongoose.connection);
        const now = Date.now().toString();
        const body = {
            data: {
                type: 'owners',
                id: TEST_OWNER_ID,
                attributes: {
                    name_first: `first name${now}`,
                    name_last: `last name${now}`,
                    tel: `090${now}`,
                    email: `${now}${process.env.SSKTS_DEVELOPER_EMAIL}`,
                    group: sskts.factory.ownerGroup.ANONYMOUS
                }
            }
        };
        yield supertest(app)
            .put(`/transactions/${TEST_TRANSACTION_ID}/owners/${TEST_OWNER_ID}`)
            .set('authorization', `Bearer ${TEST_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .send(body)
            .expect(httpStatus.OK)
            .then((response) => {
            assert.equal(response.body.data.type, 'owners');
        });
        // プロフィール更新されているかどうか確認
        const ownerDoc = yield ownerAdapter.model.findById(TEST_OWNER_ID).exec();
        assert.equal(ownerDoc.get('group'), body.data.attributes.group);
        assert.equal(ownerDoc.get('name_first'), body.data.attributes.name_first);
        assert.equal(ownerDoc.get('name_last'), body.data.attributes.name_last);
        assert.equal(ownerDoc.get('tel'), body.data.attributes.tel);
        assert.equal(ownerDoc.get('email'), body.data.attributes.email);
    }));
    it('匿名所有者から会員所有者にできる', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = sskts.adapter.owner(sskts.mongoose.connection);
        const now = Date.now().toString();
        const body = {
            data: {
                type: 'owners',
                id: TEST_OWNER_ID,
                attributes: {
                    username: `username${now}`,
                    password: `password${now}`,
                    name_first: `first name${now}`,
                    name_last: `last name${now}`,
                    tel: `090${now}`,
                    email: `${now}${process.env.SSKTS_DEVELOPER_EMAIL}`,
                    group: sskts.factory.ownerGroup.MEMBER
                }
            }
        };
        yield supertest(app)
            .put(`/transactions/${TEST_TRANSACTION_ID}/owners/${TEST_OWNER_ID}`)
            .set('authorization', `Bearer ${TEST_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .send(body)
            .expect(httpStatus.OK)
            .then((response) => {
            assert.equal(response.body.data.type, 'owners');
        });
        // プロフィール更新されているかどうか確認
        const ownerDoc = yield ownerAdapter.model.findById(TEST_OWNER_ID).exec();
        assert.equal(ownerDoc.get('group'), body.data.attributes.group);
        assert.equal(ownerDoc.get('username'), body.data.attributes.username);
        assert.equal(ownerDoc.get('name_first'), body.data.attributes.name_first);
        assert.equal(ownerDoc.get('name_last'), body.data.attributes.name_last);
        assert.equal(ownerDoc.get('tel'), body.data.attributes.tel);
        assert.equal(ownerDoc.get('email'), body.data.attributes.email);
    }));
});
describe('取引中にカード登録', () => {
    let TEST_ACCESS_TOKEN;
    let TEST_TRANSACTION_ID;
    let TEST_OWNER_ID;
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // 匿名で取引開始
        TEST_ACCESS_TOKEN = yield OAuthScenario.loginAsAdmin();
        const startTransactionResult = yield TransactionScenario.start(TEST_ACCESS_TOKEN);
        TEST_TRANSACTION_ID = startTransactionResult.transactionId;
        TEST_OWNER_ID = startTransactionResult.ownerId;
    }));
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = sskts.adapter.owner(sskts.mongoose.connection);
        const transactionAdapter = sskts.adapter.transaction(sskts.mongoose.connection);
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: TEST_TRANSACTION_ID }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(TEST_TRANSACTION_ID).exec();
        yield ownerAdapter.model.findByIdAndRemove(TEST_OWNER_ID).exec();
    }));
    it('会員所有者に変更後、カード登録できる', () => __awaiter(this, void 0, void 0, function* () {
        const now = Date.now().toString();
        const body = {
            data: {
                type: 'owners',
                id: TEST_OWNER_ID,
                attributes: {
                    username: `username${now}`,
                    password: `password${now}`,
                    name_first: `first name${now}`,
                    name_last: `last name${now}`,
                    tel: `090${now}`,
                    email: `${now}${process.env.SSKTS_DEVELOPER_EMAIL}`,
                    group: sskts.factory.ownerGroup.MEMBER
                }
            }
        };
        yield supertest(app)
            .put(`/transactions/${TEST_TRANSACTION_ID}/owners/${TEST_OWNER_ID}`)
            .set('authorization', `Bearer ${TEST_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .send(body)
            .expect(httpStatus.OK)
            .then((response) => {
            assert.equal(response.body.data.type, 'owners');
        });
        yield supertest(app)
            .post(`/transactions/${TEST_TRANSACTION_ID}/owners/${TEST_OWNER_ID}/cards`)
            .set('authorization', `Bearer ${TEST_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .send({
            data: {
                type: 'cards',
                attributes: {
                    card_no: '4111111111111111',
                    card_pass: '',
                    expire: '2812',
                    holder_name: 'AA BB'
                }
            }
        })
            .expect(httpStatus.CREATED)
            .then((response) => {
            assert.equal(response.body.data.type, 'cards');
        });
        // カードの存在を確認
        const cards = yield sskts.service.member.findCards(TEST_OWNER_ID)();
        assert.equal(cards.length, 1);
    }));
});
