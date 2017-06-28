/**
 * transactionルーターテスト
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as mongoose from 'mongoose';
import * as supertest from 'supertest';

import * as app from '../app/app';
import * as OAuthScenario from './scenarios/oauth';

const TEST_TRANSACTIONS_COUNT_UNIT_IN_SECONDS = 60;
const TEST_NUMBER_OF_TRANSACTIONS_PER_UNIT = 120;
let connection: mongoose.Connection;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    // 全て削除してからテスト開始
    const transactionAdapter = sskts.adapter.transaction(connection);
    await transactionAdapter.transactionModel.remove({}).exec();
});

describe('GET /transactions/:id', () => {
    it('取引存在しない', async () => {
        const accessToken = await OAuthScenario.loginAsAdmin();
        await supertest(app)
            .get('/transactions/58cb2e2276cee91fe4387dd1')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.NOT_FOUND)
            .then((response) => {
                assert.equal(response.body.data, null);
            });
    });

    it('取引存在する', async () => {
        // テストデータ作成
        const transaction = sskts.factory.transaction.create({
            status: sskts.factory.transactionStatus.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });
        const transactionAdapter = sskts.adapter.transaction(connection);
        await transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { upsert: true }).exec();

        const accessToken = await OAuthScenario.loginAsAdmin();

        await supertest(app)
            .get(`/transactions/${transaction.id}`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                assert.equal(response.body.data.type, 'transactions');
                assert.equal(response.body.data.id, transaction.id);
                assert.equal(response.body.data.attributes.id, transaction.id);
            });

        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    });
});

describe('取引開始', () => {
    beforeEach(() => {
        process.env.TRANSACTIONS_COUNT_UNIT_IN_SECONDS = TEST_TRANSACTIONS_COUNT_UNIT_IN_SECONDS;
        process.env.NUMBER_OF_TRANSACTIONS_PER_UNIT = TEST_NUMBER_OF_TRANSACTIONS_PER_UNIT;
    });

    it('環境変数不足だとエラー', async () => {
        delete process.env.TRANSACTIONS_COUNT_UNIT_IN_SECONDS;
        delete process.env.NUMBER_OF_TRANSACTIONS_PER_UNIT;

        const accessToken = await OAuthScenario.loginAsAdmin();

        await supertest(app)
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
    });

    it('取引数制限が0なら開始できない', async () => {
        process.env.NUMBER_OF_TRANSACTIONS_PER_UNIT = 0;

        const accessToken = await OAuthScenario.loginAsAdmin();

        await supertest(app)
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
    });

    it('スコープ不足で開始できない', async () => {
        const accessToken = await OAuthScenario.loginAsMember(['xxx']);

        await supertest(app)
            .post('/transactions/startIfPossible')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({
                expires_at: Date.now()
            })
            .expect(httpStatus.FORBIDDEN)
            .then((response) => {
                assert.equal(response.text, 'Forbidden');
            });
    });

    it('匿名所有者として開始できる', async () => {
        const transactionAdapter = sskts.adapter.transaction(connection);

        const accessToken = await OAuthScenario.loginAsAdmin();

        const transactionId = await supertest(app)
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

        await transactionAdapter.transactionModel.findByIdAndRemove(transactionId).exec();
    });

    it('会員所有者として開始できる', async () => {
        const transactionAdapter = sskts.adapter.transaction(connection);

        const accessToken = await OAuthScenario.loginAsMember(['transactions']);

        const transactionId = await supertest(app)
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
        const transactionOption = await sskts.service.transactionWithId.findById(transactionId)(transactionAdapter);
        assert(transactionOption.isDefined);
        assert.equal(transactionOption.get().status, sskts.factory.transactionStatus.UNDERWAY);
        const memberOwner = transactionOption.get().owners.find((owner) => owner.id === OAuthScenario.TEST_OWNER_ID);
        assert(memberOwner !== undefined);

        // テスト取引削除
        await transactionAdapter.transactionModel.findByIdAndRemove(transactionId).exec();
    });
});

describe('POST /transactions/:id/authorizations/mvtk', () => {
    it('ムビチケ承認追加できる', async () => {
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
        await ownerAdapter.model.findByIdAndUpdate(owner1.id, owner1, { new: true, upsert: true }).exec();
        await ownerAdapter.model.findByIdAndUpdate(owner2.id, owner2, { new: true, upsert: true }).exec();
        const update = { ...transaction, ...{ owners: [owner1.id, owner2.id] } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(update.id, update, { new: true, upsert: true }).exec();

        const accessToken = await OAuthScenario.loginAsAdmin();

        const authorizationId = await supertest(app)
            .post(`/transactions/${transaction.id}/authorizations/mvtk`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({
                owner_from: owner1.id,
                owner_to: owner2.id,
                price: 999, // tslint:disable-line:no-magic-numbers
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
                    }],
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

                return <string>response.body.data.id;
            });

        // 取引イベントからオーソリIDで検索して、取引IDの一致を確認
        const transactionEvent = await transactionAdapter.transactionEventModel.findOne(
            { 'authorization.id': authorizationId }
        ).exec();
        if (transactionEvent === null) {
            throw new Error('transactionEvent should exist');
        }

        assert.equal(transactionEvent.get('transaction'), transaction.id);

        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(owner1.id).exec();
        await ownerAdapter.model.findByIdAndRemove(owner2.id).exec();
    });

    it('scren_cdパラメータ不足でムビチケ承認追加失敗', async () => {
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
        await ownerAdapter.model.findByIdAndUpdate(owner1.id, owner1, { new: true, upsert: true }).exec();
        await ownerAdapter.model.findByIdAndUpdate(owner2.id, owner2, { new: true, upsert: true }).exec();
        const update = { ...transaction, ...{ owners: [owner1.id, owner2.id] } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(update.id, update, { new: true, upsert: true }).exec();

        const accessToken = await OAuthScenario.loginAsAdmin();

        await supertest(app)
            .post(`/transactions/${transaction.id}/authorizations/mvtk`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({
                owner_from: 'xxx',
                owner_to: 'xxx',
                price: 999, // tslint:disable-line:no-magic-numbers
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
                    }],
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
                assert.equal(response.body.errors[0].source.parameter, 'scren_cd');
            });

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(owner1.id).exec();
        await ownerAdapter.model.findByIdAndRemove(owner2.id).exec();
    });
});

describe('座席予約承認追加', () => {
    it('ok', async () => {
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
        await ownerAdapter.model.findByIdAndUpdate(owner1.id, owner1, { new: true, upsert: true }).exec();
        await ownerAdapter.model.findByIdAndUpdate(owner2.id, owner2, { new: true, upsert: true }).exec();
        const update = { ...transaction, ...{ owners: [owner1.id, owner2.id] } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(update.id, update, { new: true, upsert: true }).exec();

        const accessToken = await OAuthScenario.loginAsAdmin();

        const authorizationId = await supertest(app)
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

                return <string>response.body.data.id;
            });

        // 取引イベントからオーソリIDで検索して、取引IDの一致を確認
        const transactionEvent = await transactionAdapter.transactionEventModel.findOne({ 'authorization.id': authorizationId }).exec();
        if (transactionEvent === null) {
            throw new Error('transactionEvent should exist');
        }
        assert.equal(transactionEvent.get('transaction'), transaction.id);

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(owner1.id).exec();
        await ownerAdapter.model.findByIdAndRemove(owner2.id).exec();
    });

    it('coa_screen_codeパラメータ不足で失敗', async () => {
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
        await ownerAdapter.model.findByIdAndUpdate(owner1.id, owner1, { new: true, upsert: true }).exec();
        await ownerAdapter.model.findByIdAndUpdate(owner2.id, owner2, { new: true, upsert: true }).exec();
        const update = { ...transaction, ...{ owners: [owner1.id, owner2.id] } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(update.id, update, { new: true, upsert: true }).exec();

        const accessToken = await OAuthScenario.loginAsAdmin();

        await supertest(app)
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
                assert.equal(response.body.errors[0].source.parameter, 'coa_screen_code');
            });

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(owner1.id).exec();
        await ownerAdapter.model.findByIdAndRemove(owner2.id).exec();
    });
});
