/**
 * 会員としての取引シナリオテスト
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as moment from 'moment';
import * as supertest from 'supertest';

import * as app from '../../app/app';
import * as Resources from '../resources';
import * as OAuthScenario from './oauth';
import * as TransactionScenario from './transaction';

const TEST_GMO_SHOP_ID = 'tshop00026096';
const TEST_GMO_SHOP_PASS = 'xbxmkaa6';

interface IPurchaser {
    username?: string;
    password?: string;
    name_first: string;
    name_last: string;
    tel: string;
    email: string;
    group: sskts.factory.ownerGroup;
}

let connection: sskts.mongoose.Connection;
before(async () => {
    connection = sskts.mongoose.createConnection(process.env.MONGOLAB_URI);
});

describe('一般購入シナリオ', () => {
    let client: Resources.IClient;
    beforeEach(async () => {
        client = await Resources.createClient();
    });
    afterEach(async () => {
        // テストクライアント削除
        const clientAdapter = sskts.adapter.client(connection);
        await clientAdapter.clientModel.findByIdAndRemove(client.id).exec();
    });

    it('成立までたどりつけて照会できる', async () => {
        // テストデータインポート
        const performanceAdapter = sskts.adapter.performance(connection);

        const tomorrow = moment().add(1, 'day');
        await Resources.importMasters(moment().add(1, 'day').toDate());

        // パフォーマンスをひとつ取得して購入フローへ
        const performanceDoc = await performanceAdapter.model.findOne({ day: tomorrow.format('YYYYMMDD') }).exec();
        if (performanceDoc === null) {
            throw new Error('performance tomorrow not found');
        }

        const purchaser = {
            name_first: 'てつ',
            name_last: 'やまざき',
            tel: '09012345678',
            email: process.env.SSKTS_DEVELOPER_EMAIL,
            group: sskts.factory.ownerGroup.ANONYMOUS
        };

        const makeInquiryResult = await processTransactionByPerformance(performanceDoc.get(('id')), purchaser);
        assert.equal(makeInquiryResult.type, 'transactions');
        assert.equal(typeof makeInquiryResult.id, 'string');
        assert.equal(makeInquiryResult.id, makeInquiryResult.attributes.id);
        assert.equal(makeInquiryResult.attributes.status, sskts.factory.transactionStatus.CLOSED);
        assert.equal(makeInquiryResult.attributes.queues_status, sskts.factory.transactionQueuesStatus.UNEXPORTED);

        // 匿名所有者が取引に存在することを確認
        const ownerInTransaction = makeInquiryResult.attributes.owners.find(
            (owner: any) => owner.group === sskts.factory.ownerGroup.ANONYMOUS
        );
        assert.notEqual(ownerInTransaction, undefined);
    });

    it('途中で会員になり、成立までたどりつけて照会できる、かつ、ログインできる', async () => {
        // テストデータインポート
        const performanceAdapter = sskts.adapter.performance(connection);

        const tomorrow = moment().add(1, 'day');
        await Resources.importMasters(moment().add(1, 'day').toDate());

        // パフォーマンスをひとつ取得して購入フローへ
        const performanceDoc = await performanceAdapter.model.findOne({ day: tomorrow.format('YYYYMMDD') }).exec();
        if (performanceDoc === null) {
            throw new Error('performance tomorrow not found');
        }

        const purchaser = {
            username: `sskts-api:test:scenarios:transactions-test:${Date.now().toString()}`,
            password: 'password',
            name_first: 'てつ',
            name_last: 'やまざき',
            tel: '09012345678',
            email: process.env.SSKTS_DEVELOPER_EMAIL,
            group: sskts.factory.ownerGroup.MEMBER
        };

        // ログインできないことを確認
        await OAuthScenario.loginAsMember(
            client.id, 'test', purchaser.username, purchaser.password, ['owners']
        ).catch((error) => {
            assert(error instanceof Error);
        });

        // 取引が成立までたどりつけることを確認
        const makeInquiryResult = await processTransactionByPerformance(performanceDoc.get(('id')), purchaser);
        assert.equal(makeInquiryResult.type, 'transactions');
        assert.equal(typeof makeInquiryResult.id, 'string');
        assert.equal(makeInquiryResult.id, makeInquiryResult.attributes.id);
        assert.equal(makeInquiryResult.attributes.status, sskts.factory.transactionStatus.CLOSED);
        assert.equal(makeInquiryResult.attributes.queues_status, sskts.factory.transactionQueuesStatus.UNEXPORTED);

        // 会員所有者が取引に存在することを確認
        const ownerInTransaction = makeInquiryResult.attributes.owners.find(
            (owner: any) => owner.group === sskts.factory.ownerGroup.MEMBER
        );
        assert.notEqual(ownerInTransaction, undefined);

        // ログインできることを確認
        await OAuthScenario.loginAsMember(
            client.id, 'test', purchaser.username, purchaser.password, ['owners']
        ).then((acccessToken) => {
            assert.equal(typeof acccessToken, 'string');
        });
    });
});

/**
 * パフォーマンス指定で取引を進行する
 *
 * @param {string} performanceId パフォーマンスID
 * @returns {any} makeInquiryResult 取引照会結果
 */
// tslint:disable-next-line:max-func-body-length
async function processTransactionByPerformance(performanceId: string, purchaser: IPurchaser) {
    // アクセストークン取得
    const accessToken = await OAuthScenario.loginAsAdmin();

    // パフォーマンス取得
    const performance = await supertest(app)
        .get(`/performances/${performanceId}`)
        .set('authorization', `Bearer ${accessToken}`)
        .set('Accept', 'application/json')
        .expect(httpStatus.OK)
        .then((response) => response.body.data.attributes);

    // 作品取得
    const film = await supertest(app)
        .get(`/films/${performance.film.id}`)
        .set('authorization', `Bearer ${accessToken}`)
        .set('Accept', 'application/json')
        .expect(httpStatus.OK)
        .then((response) => response.body.data.attributes);

    // スクリーン取得
    const screen = await supertest(app)
        .get(`/screens/${performance.screen.id}`)
        .set('authorization', `Bearer ${accessToken}`)
        .set('Accept', 'application/json')
        .expect(httpStatus.OK)
        .then((response) => response.body.data.attributes);

    const theaterCode = performance.theater.id;
    const dateJouei = performance.day;
    const titleCode = film.coa_title_code;
    const titleBranchNum = film.coa_title_branch_num;
    const timeBegin = performance.time_start;
    const screenCode = screen.coa_screen_code;

    // 取引開始
    const startTransactionResult = await TransactionScenario.start(accessToken);
    const transactionId = <string>startTransactionResult.transactionId;
    const anonymousOwnerId = <string>startTransactionResult.ownerId;
    const promoterOwnerId = <string>startTransactionResult.promoterOwnerId;

    // 販売可能チケット検索
    const salesTicketResult = await sskts.COA.ReserveService.salesTicket({
        theater_code: theaterCode,
        date_jouei: dateJouei,
        title_code: titleCode,
        title_branch_num: titleBranchNum,
        time_begin: timeBegin
    });

    // COA空席確認
    const getStateReserveSeatResult = await sskts.COA.ReserveService.stateReserveSeat({
        theater_code: theaterCode,
        date_jouei: dateJouei,
        title_code: titleCode,
        title_branch_num: titleBranchNum,
        time_begin: timeBegin,
        screen_code: screenCode
    });
    const sectionCode = getStateReserveSeatResult.list_seat[0].seat_section;
    const freeSeatCodes = getStateReserveSeatResult.list_seat[0].list_free_seat.map((freeSeat) => {
        return freeSeat.seat_num;
    });
    if (getStateReserveSeatResult.cnt_reserve_free === 0) {
        throw new Error('no available seats.');
    }

    // COA仮予約
    const reserveSeatsTemporarilyResult = await sskts.COA.ReserveService.updTmpReserveSeat({
        theater_code: theaterCode,
        date_jouei: dateJouei,
        title_code: titleCode,
        title_branch_num: titleBranchNum,
        time_begin: timeBegin,
        screen_code: screenCode,
        list_seat: [{
            seat_section: sectionCode,
            seat_num: freeSeatCodes[0]
        }]
    });

    // COAオーソリ追加
    const totalPrice = salesTicketResult[0].sale_price;

    const coaAuthorizationId = await supertest(app)
        .post(`/transactions/${transactionId}/authorizations/coaSeatReservation`)
        .set('authorization', `Bearer ${accessToken}`)
        .set('Accept', 'application/json')
        .send({
            owner_from: promoterOwnerId,
            owner_to: anonymousOwnerId,
            coa_tmp_reserve_num: reserveSeatsTemporarilyResult.tmp_reserve_num,
            coa_theater_code: theaterCode,
            coa_date_jouei: dateJouei,
            coa_title_code: titleCode,
            coa_title_branch_num: titleBranchNum,
            coa_time_begin: timeBegin,
            coa_screen_code: screenCode,
            seats: reserveSeatsTemporarilyResult.list_tmp_reserve.map((tmpReserve) => {
                return {
                    performance: performance.id,
                    screen_section: tmpReserve.seat_section,
                    seat_code: tmpReserve.seat_num,
                    ticket_code: salesTicketResult[0].ticket_code,
                    ticket_name: {
                        ja: salesTicketResult[0].ticket_name,
                        en: salesTicketResult[0].ticket_name_eng
                    },
                    ticket_name_kana: salesTicketResult[0].ticket_name_kana,
                    std_price: salesTicketResult[0].std_price,
                    add_price: salesTicketResult[0].add_price,
                    dis_price: 0,
                    sale_price: salesTicketResult[0].sale_price,
                    mvtk_app_price: 0,
                    add_glasses: 0,
                    kbn_eisyahousiki: '00',
                    mvtk_num: '',
                    mvtk_kbn_denshiken: '00',
                    mvtk_kbn_maeuriken: '00',
                    mvtk_kbn_kensyu: '00',
                    mvtk_sales_price: 0
                };
            }),
            price: totalPrice
        })
        .expect(httpStatus.OK)
        .then((response) => response.body.data.id);

    // COA仮予約削除
    await sskts.COA.ReserveService.delTmpReserve({
        theater_code: theaterCode,
        date_jouei: dateJouei,
        title_code: titleCode,
        title_branch_num: titleBranchNum,
        time_begin: timeBegin,
        // screen_code: screenCode,
        tmp_reserve_num: reserveSeatsTemporarilyResult.tmp_reserve_num
    });

    // COAオーソリ削除
    await supertest(app)
        .del(`/transactions/${transactionId}/authorizations/${coaAuthorizationId}`)
        .set('authorization', `Bearer ${accessToken}`)
        .set('Accept', 'application/json')
        .expect(httpStatus.NO_CONTENT);

    // GMOオーソリ取得
    let orderId = Date.now().toString();
    const entryTranResult = await sskts.GMO.services.credit.entryTran({
        shopId: TEST_GMO_SHOP_ID,
        shopPass: TEST_GMO_SHOP_PASS,
        orderId: orderId,
        jobCd: sskts.GMO.utils.util.JOB_CD_AUTH,
        amount: totalPrice
    });

    await sskts.GMO.services.credit.execTran({
        accessId: entryTranResult.accessId,
        accessPass: entryTranResult.accessPass,
        orderId: orderId,
        method: '1',
        cardNo: '4111111111111111',
        expire: '2012',
        securityCode: '123'
    });

    // GMOオーソリ追加
    const gmoAuthorizationId = await supertest(app)
        .post(`/transactions/${transactionId}/authorizations/gmo`)
        .set('authorization', `Bearer ${accessToken}`)
        .set('Accept', 'application/json')
        .send({
            owner_from: anonymousOwnerId,
            owner_to: promoterOwnerId,
            gmo_shop_id: TEST_GMO_SHOP_ID,
            gmo_shop_pass: TEST_GMO_SHOP_PASS,
            gmo_order_id: orderId,
            gmo_amount: totalPrice,
            gmo_access_id: entryTranResult.accessId,
            gmo_access_pass: entryTranResult.accessPass,
            gmo_job_cd: sskts.GMO.utils.util.JOB_CD_AUTH,
            gmo_pay_type: sskts.GMO.utils.util.PAY_TYPE_CREDIT
        })
        .expect(httpStatus.OK)
        .then((response) => response.body.data.id);

    // GMOオーソリ取消
    await sskts.GMO.services.credit.alterTran({
        shopId: TEST_GMO_SHOP_ID,
        shopPass: TEST_GMO_SHOP_PASS,
        accessId: entryTranResult.accessId,
        accessPass: entryTranResult.accessPass,
        jobCd: sskts.GMO.utils.util.JOB_CD_VOID
    });

    // GMOオーソリ削除
    await supertest(app)
        .del(`/transactions/${transactionId}/authorizations/${gmoAuthorizationId}`)
        .set('authorization', `Bearer ${accessToken}`)
        .set('Accept', 'application/json')
        .expect(httpStatus.NO_CONTENT);

    // COA仮予約2回目
    const reserveSeatsTemporarilyResult2 = await sskts.COA.ReserveService.updTmpReserveSeat({
        theater_code: theaterCode,
        date_jouei: dateJouei,
        title_code: titleCode,
        title_branch_num: titleBranchNum,
        time_begin: timeBegin,
        screen_code: screenCode,
        list_seat: [{
            seat_section: sectionCode,
            seat_num: freeSeatCodes[0]
        }]
    });

    // COAオーソリ追加
    await supertest(app)
        .post(`/transactions/${transactionId}/authorizations/coaSeatReservation`)
        .set('authorization', `Bearer ${accessToken}`)
        .set('Accept', 'application/json')
        .send({
            owner_from: promoterOwnerId,
            owner_to: anonymousOwnerId,
            coa_tmp_reserve_num: reserveSeatsTemporarilyResult2.tmp_reserve_num,
            coa_theater_code: theaterCode,
            coa_date_jouei: dateJouei,
            coa_title_code: titleCode,
            coa_title_branch_num: titleBranchNum,
            coa_time_begin: timeBegin,
            coa_screen_code: screenCode,
            seats: reserveSeatsTemporarilyResult2.list_tmp_reserve.map((tmpReserve) => {
                return {
                    performance: performance.id,
                    screen_section: tmpReserve.seat_section,
                    seat_code: tmpReserve.seat_num,
                    ticket_code: salesTicketResult[0].ticket_code,
                    ticket_name: {
                        ja: salesTicketResult[0].ticket_name,
                        en: salesTicketResult[0].ticket_name_eng
                    },
                    ticket_name_kana: salesTicketResult[0].ticket_name_kana,
                    std_price: salesTicketResult[0].std_price,
                    add_price: salesTicketResult[0].add_price,
                    dis_price: 0,
                    sale_price: salesTicketResult[0].sale_price,
                    mvtk_app_price: 0,
                    add_glasses: 0,
                    kbn_eisyahousiki: '00',
                    mvtk_num: '',
                    mvtk_kbn_denshiken: '00',
                    mvtk_kbn_maeuriken: '00',
                    mvtk_kbn_kensyu: '00',
                    mvtk_sales_price: 0
                };
            }),
            price: totalPrice
        })
        .expect(httpStatus.OK);

    // GMOオーソリ取得(2回目)
    orderId = Date.now().toString();
    const entryTranResult2 = await sskts.GMO.services.credit.entryTran({
        shopId: TEST_GMO_SHOP_ID,
        shopPass: TEST_GMO_SHOP_PASS,
        orderId: orderId,
        jobCd: sskts.GMO.utils.util.JOB_CD_AUTH,
        amount: totalPrice
    });

    await sskts.GMO.services.credit.execTran({
        accessId: entryTranResult2.accessId,
        accessPass: entryTranResult2.accessPass,
        orderId: orderId,
        method: '1',
        cardNo: '4111111111111111',
        expire: '2012',
        securityCode: '123'
    });

    // GMOオーソリ追加
    await supertest(app)
        .post(`/transactions/${transactionId}/authorizations/gmo`)
        .set('authorization', `Bearer ${accessToken}`)
        .set('Accept', 'application/json')
        .send({
            owner_from: anonymousOwnerId,
            owner_to: promoterOwnerId,
            gmo_shop_id: TEST_GMO_SHOP_ID,
            gmo_shop_pass: TEST_GMO_SHOP_PASS,
            gmo_order_id: orderId,
            gmo_amount: totalPrice,
            gmo_access_id: entryTranResult2.accessId,
            gmo_access_pass: entryTranResult2.accessPass,
            gmo_job_cd: sskts.GMO.utils.util.JOB_CD_AUTH,
            gmo_pay_type: sskts.GMO.utils.util.PAY_TYPE_CREDIT
        })
        .expect(httpStatus.OK);

    // 購入者情報登録(会員の場合カード登録も)
    switch (purchaser.group) {
        case sskts.factory.ownerGroup.ANONYMOUS:
            await supertest(app)
                .patch(`/transactions/${transactionId}/anonymousOwner`)
                .set('authorization', `Bearer ${accessToken}`)
                .set('Accept', 'application/json')
                .send({
                    name_first: purchaser.name_first,
                    name_last: purchaser.name_last,
                    tel: purchaser.tel,
                    email: purchaser.email
                })
                .expect(httpStatus.NO_CONTENT);

            break;

        case sskts.factory.ownerGroup.MEMBER:
            await supertest(app)
                .put(`/transactions/${transactionId}/owners/${anonymousOwnerId}`)
                .set('authorization', `Bearer ${accessToken}`)
                .set('Accept', 'application/json')
                .send({
                    data: {
                        type: 'owners',
                        id: anonymousOwnerId,
                        attributes: {
                            username: purchaser.username,
                            password: purchaser.password,
                            name_first: purchaser.name_first,
                            name_last: purchaser.name_last,
                            tel: purchaser.tel,
                            email: purchaser.email,
                            group: purchaser.group
                        }
                    }
                })
                .expect(httpStatus.OK);

            await supertest(app)
                .post(`/transactions/${transactionId}/owners/${anonymousOwnerId}/cards`)
                .set('authorization', `Bearer ${accessToken}`)
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
                .expect(httpStatus.CREATED);

            break;

        default:
            break;
    }

    // 照会情報登録(購入番号と電話番号で照会する場合)
    await supertest(app)
        .patch(`/transactions/${transactionId}/enableInquiry`)
        .set('authorization', `Bearer ${accessToken}`)
        .set('Accept', 'application/json')
        .send({
            inquiry_theater: theaterCode,
            inquiry_id: reserveSeatsTemporarilyResult2.tmp_reserve_num,
            inquiry_pass: purchaser.tel
        })
        .expect(httpStatus.NO_CONTENT);

    // メール追加
    const content = `
sskts-api:examples:transaction 様\n
\n
-------------------------------------------------------------------\n
この度はご購入いただき誠にありがとうございます。\n
\n
※チケット発券時は、自動発券機に下記チケットQRコードをかざしていただくか、購入番号と電話番号を入力していただく必要があります。\n
-------------------------------------------------------------------\n
\n
◆購入番号 ：${reserveSeatsTemporarilyResult2.tmp_reserve_num}\n
◆電話番号 ：${purchaser.tel}\n
◆合計金額 ：${totalPrice}円\n
\n
※このアドレスは送信専用です。返信はできませんのであらかじめご了承下さい。\n
-------------------------------------------------------------------\n
シネマサンシャイン\n
http://www.cinemasunshine.co.jp/\n
-------------------------------------------------------------------\n
`;
    const notificationId = await supertest(app)
        .post(`/transactions/${transactionId}/notifications/email`)
        .set('authorization', `Bearer ${accessToken}`)
        .set('Accept', 'application/json')
        .send({
            from: 'noreply@example.com',
            to: process.env.SSKTS_DEVELOPER_EMAIL,
            subject: '購入完了',
            content: content
        })
        .expect(httpStatus.OK)
        .then((response) => <string>response.body.data.id);

    // メール削除
    await supertest(app)
        .del(`/transactions/${transactionId}/notifications/${notificationId}`)
        .set('authorization', `Bearer ${accessToken}`)
        .set('Accept', 'application/json')
        .send({
        })
        .expect(httpStatus.NO_CONTENT);

    // 再度メール追加
    await supertest(app)
        .post(`/transactions/${transactionId}/notifications/email`)
        .set('authorization', `Bearer ${accessToken}`)
        .set('Accept', 'application/json')
        .send({
            from: 'noreply@example.com',
            to: process.env.SSKTS_DEVELOPER_EMAIL,
            subject: '購入完了',
            content: content
        })
        .expect(httpStatus.OK);

    // 取引成立
    await supertest(app)
        .patch(`/transactions/${transactionId}/close`)
        .set('authorization', `Bearer ${accessToken}`)
        .set('Accept', 'application/json')
        .send({
        })
        .expect(httpStatus.NO_CONTENT);

    // 照会してみる
    return await supertest(app)
        .post('/transactions/makeInquiry')
        .set('authorization', `Bearer ${accessToken}`)
        .set('Accept', 'application/json')
        .send({
            inquiry_theater: theaterCode,
            inquiry_id: reserveSeatsTemporarilyResult2.tmp_reserve_num,
            inquiry_pass: purchaser.tel
        })
        .expect(httpStatus.OK)
        .then((response) => response.body.data);
}
