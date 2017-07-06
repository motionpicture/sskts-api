/**
 * transactionルーターテスト
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as supertest from 'supertest';

import * as app from '../../app/app';
import * as Resources from '../resources';
import * as OAuthScenario from '../scenarios/oauth';
import * as TransactionScenario from '../scenarios/transaction';

const TEST_TRANSACTIONS_COUNT_UNIT_IN_SECONDS = 60;
const TEST_NUMBER_OF_TRANSACTIONS_PER_UNIT = 120;
let connection: sskts.mongoose.Connection;
before(async () => {
    connection = sskts.mongoose.createConnection(process.env.MONGOLAB_URI);

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
            });

        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    });
});

describe('取引開始', () => {
    let client: Resources.IClient;
    let memberOwner: Resources.IMemberOwner;
    beforeEach(async () => {
        process.env.TRANSACTIONS_COUNT_UNIT_IN_SECONDS = TEST_TRANSACTIONS_COUNT_UNIT_IN_SECONDS;
        process.env.NUMBER_OF_TRANSACTIONS_PER_UNIT = TEST_NUMBER_OF_TRANSACTIONS_PER_UNIT;

        client = await Resources.createClient();
        // テスト会員作成
        memberOwner = await Resources.createMemberOwner();
    });
    afterEach(async () => {
        // テストクライアント削除
        const clientAdapter = sskts.adapter.client(connection);
        await clientAdapter.clientModel.findByIdAndRemove(client.id).exec();

        // テスト会員削除
        const ownerAdapter = sskts.adapter.owner(connection);
        await ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
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
        const accessToken = await OAuthScenario.loginAsMember(
            client.id, 'test', memberOwner.username, memberOwner.password, ['xxx']
        );

        await supertest(app)
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

        const accessToken = await OAuthScenario.loginAsMember(
            client.id, 'test', memberOwner.username, memberOwner.password, ['transactions']
        );

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
        const memberOwnerInTransaction = transactionOption.get().owners.find((owner) => owner.id === memberOwner.id);
        assert(memberOwnerInTransaction !== undefined);

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
            });

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(owner1.id).exec();
        await ownerAdapter.model.findByIdAndRemove(owner2.id).exec();
    });
});

describe('取引中に匿名所有者更新', () => {
    let TEST_ACCESS_TOKEN: string;
    let TEST_TRANSACTION_ID: string;
    let TEST_OWNER_ID: string;

    beforeEach(async () => {
        // 匿名で取引開始
        TEST_ACCESS_TOKEN = await OAuthScenario.loginAsAdmin();
        const startTransactionResult = await TransactionScenario.start(TEST_ACCESS_TOKEN);
        TEST_TRANSACTION_ID = startTransactionResult.transactionId;
        TEST_OWNER_ID = startTransactionResult.ownerId;
    });

    afterEach(async () => {
        const ownerAdapter = sskts.adapter.owner(sskts.mongoose.connection);
        const transactionAdapter = sskts.adapter.transaction(sskts.mongoose.connection);

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: TEST_TRANSACTION_ID }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(TEST_TRANSACTION_ID).exec();
        await ownerAdapter.model.findByIdAndRemove(TEST_OWNER_ID).exec();
    });

    it('更新できる', async () => {
        const ownerAdapter = sskts.adapter.owner(sskts.mongoose.connection);

        const now = Date.now().toString();
        const profile = {
            name_first: `first name${now}`,
            name_last: `last name${now}`,
            tel: `090${now}`,
            email: `${now}${process.env.SSKTS_DEVELOPER_EMAIL}`
        };
        await supertest(app)
            .patch(`/transactions/${TEST_TRANSACTION_ID}/anonymousOwner`)
            .set('authorization', `Bearer ${TEST_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .send(profile)
            .expect(httpStatus.NO_CONTENT);

        // プロフィール更新されているかどうか確認
        const ownerDoc = <sskts.mongoose.Document>await ownerAdapter.model.findById(TEST_OWNER_ID).exec();
        assert.equal(ownerDoc.get('name_first'), profile.name_first);
        assert.equal(ownerDoc.get('name_last'), profile.name_last);
        assert.equal(ownerDoc.get('tel'), profile.tel);
        assert.equal(ownerDoc.get('email'), profile.email);
    });
});

describe('取引中に所有者置換', () => {
    let TEST_ACCESS_TOKEN: string;
    let TEST_TRANSACTION_ID: string;
    let TEST_OWNER_ID: string;

    beforeEach(async () => {
        // 匿名で取引開始
        TEST_ACCESS_TOKEN = await OAuthScenario.loginAsAdmin();
        const startTransactionResult = await TransactionScenario.start(TEST_ACCESS_TOKEN);
        TEST_TRANSACTION_ID = startTransactionResult.transactionId;
        TEST_OWNER_ID = startTransactionResult.ownerId;
    });

    afterEach(async () => {
        const ownerAdapter = sskts.adapter.owner(sskts.mongoose.connection);
        const transactionAdapter = sskts.adapter.transaction(sskts.mongoose.connection);

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: TEST_TRANSACTION_ID }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(TEST_TRANSACTION_ID).exec();
        await ownerAdapter.model.findByIdAndRemove(TEST_OWNER_ID).exec();
    });

    it('匿名所有者から匿名所有者にできる', async () => {
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
        await supertest(app)
            .put(`/transactions/${TEST_TRANSACTION_ID}/owners/${TEST_OWNER_ID}`)
            .set('authorization', `Bearer ${TEST_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .send(body)
            .expect(httpStatus.OK)
            .then((response) => {
                assert.equal(response.body.data.type, 'owners');
            });

        // プロフィール更新されているかどうか確認
        const ownerDoc = <sskts.mongoose.Document>await ownerAdapter.model.findById(TEST_OWNER_ID).exec();
        assert.equal(ownerDoc.get('group'), body.data.attributes.group);
        assert.equal(ownerDoc.get('name_first'), body.data.attributes.name_first);
        assert.equal(ownerDoc.get('name_last'), body.data.attributes.name_last);
        assert.equal(ownerDoc.get('tel'), body.data.attributes.tel);
        assert.equal(ownerDoc.get('email'), body.data.attributes.email);
    });

    it('匿名所有者から会員所有者にできる', async () => {
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
        await supertest(app)
            .put(`/transactions/${TEST_TRANSACTION_ID}/owners/${TEST_OWNER_ID}`)
            .set('authorization', `Bearer ${TEST_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .send(body)
            .expect(httpStatus.OK)
            .then((response) => {
                assert.equal(response.body.data.type, 'owners');
            });

        // プロフィール更新されているかどうか確認
        const ownerDoc = <sskts.mongoose.Document>await ownerAdapter.model.findById(TEST_OWNER_ID).exec();
        assert.equal(ownerDoc.get('group'), body.data.attributes.group);
        assert.equal(ownerDoc.get('username'), body.data.attributes.username);
        assert.equal(ownerDoc.get('name_first'), body.data.attributes.name_first);
        assert.equal(ownerDoc.get('name_last'), body.data.attributes.name_last);
        assert.equal(ownerDoc.get('tel'), body.data.attributes.tel);
        assert.equal(ownerDoc.get('email'), body.data.attributes.email);
    });
});

describe('取引中にカード登録', () => {
    let TEST_ACCESS_TOKEN: string;
    let TEST_TRANSACTION_ID: string;
    let TEST_OWNER_ID: string;

    beforeEach(async () => {
        // 匿名で取引開始
        TEST_ACCESS_TOKEN = await OAuthScenario.loginAsAdmin();
        const startTransactionResult = await TransactionScenario.start(TEST_ACCESS_TOKEN);
        TEST_TRANSACTION_ID = startTransactionResult.transactionId;
        TEST_OWNER_ID = startTransactionResult.ownerId;
    });

    afterEach(async () => {
        const ownerAdapter = sskts.adapter.owner(sskts.mongoose.connection);
        const transactionAdapter = sskts.adapter.transaction(sskts.mongoose.connection);

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: TEST_TRANSACTION_ID }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(TEST_TRANSACTION_ID).exec();
        await ownerAdapter.model.findByIdAndRemove(TEST_OWNER_ID).exec();
    });

    it('会員所有者に変更後、カード登録できる', async () => {
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
        await supertest(app)
            .put(`/transactions/${TEST_TRANSACTION_ID}/owners/${TEST_OWNER_ID}`)
            .set('authorization', `Bearer ${TEST_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .send(body)
            .expect(httpStatus.OK)
            .then((response) => {
                assert.equal(response.body.data.type, 'owners');
            });

        await supertest(app)
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
        const cards = await sskts.service.member.findCards(TEST_OWNER_ID)();
        assert.equal(cards.length, 1);
    });
});
