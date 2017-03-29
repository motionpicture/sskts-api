/**
 * transactionルーターテスト
 *
 * @ignore
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as supertest from 'supertest';

import * as app from '../app/app';

let connection: mongoose.Connection;
before(async () => {
    // 全て削除してからテスト開始
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    const transactionAdapter = sskts.adapter.transaction(connection);
    await transactionAdapter.transactionModel.remove({}).exec();
});

describe('GET /transactions/:id', () => {
    it('取引存在しない', async () => {
        await supertest(app)
            .get('/transactions/58cb2e2276cee91fe4387dd1')
            .set('authorization', 'Bearer ' + process.env.SSKTS_API_ACCESS_TOKEN)
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

        await supertest(app)
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

        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    });
});

describe('POST /transactions/startIfPossible', () => {
    it('開始可能な取引存在しない', async () => {
        await supertest(app)
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
    });

    it('開始可能な取引存在する', async () => {
        // テストデータ作成
        const transaction = sskts.factory.transaction.create({
            status: sskts.factory.transactionStatus.READY,
            owners: [],
            expires_at: moment().add(10, 'seconds').toDate() // tslint:disable-line:no-magic-numbers
        });
        const transactionAdapter = sskts.adapter.transaction(connection);
        await transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { upsert: true }).exec();

        await supertest(app)
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

        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
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
        const update = Object.assign(transaction, { owners: [owner1.id, owner2.id] });
        await transactionAdapter.transactionModel.findByIdAndUpdate(update.id, update, { new: true, upsert: true }).exec();

        let authorizationId = '';
        await supertest(app)
            .post('/transactions/' + transaction.id + '/authorizations/mvtk')
            .set('authorization', 'Bearer ' + process.env.SSKTS_API_ACCESS_TOKEN)
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
                authorizationId = response.body.data.id;
            });

        // 取引イベントからオーソリIDで検索して、取引IDの一致を確認
        const transactionEvent = await transactionAdapter.transactionEventModel.findOne(
            {
                'authorization.id': authorizationId
            }
        ).exec();
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
        const update = Object.assign(transaction, { owners: [owner1.id, owner2.id] });
        await transactionAdapter.transactionModel.findByIdAndUpdate(update.id, update, { new: true, upsert: true }).exec();

        await supertest(app)
            .post('/transactions/' + transaction.id + '/authorizations/mvtk')
            .set('authorization', 'Bearer ' + process.env.SSKTS_API_ACCESS_TOKEN)
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
