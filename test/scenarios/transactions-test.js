"use strict";
/**
 * 取引シナリオテスト
 *
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
const COA = require("@motionpicture/coa-service");
const GMO = require("@motionpicture/gmo-service");
const sskts = require("@motionpicture/sskts-domain");
const assert = require("assert");
const httpStatus = require("http-status");
const moment = require("moment");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../../app/app");
const TEST_THEATER_ID = '118';
const TEST_GMO_SHOP_ID = 'tshop00026096';
const TEST_GMO_SHOP_PASS = 'xbxmkaa6';
const TEST_OWNER = {
    name_first: 'てつ',
    name_last: 'やまざき',
    tel: '09012345678',
    email: process.env.SSKTS_DEVELOPER_EMAIL
};
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    // 全て削除してからテスト開始
    const performanceAdapter = sskts.adapter.performance(connection);
    yield performanceAdapter.model.remove({}).exec();
}));
describe('一般購入シナリオ', () => {
    it('成立までたどりつけて照会できる', () => __awaiter(this, void 0, void 0, function* () {
        // テストデータインポート
        const theaterAdapter = sskts.adapter.theater(connection);
        const filmAdapter = sskts.adapter.film(connection);
        const screenAdapter = sskts.adapter.screen(connection);
        const performanceAdapter = sskts.adapter.performance(connection);
        const tomorrow = moment().add(1, 'day');
        yield sskts.service.master.importTheater(TEST_THEATER_ID)(theaterAdapter);
        yield sskts.service.master.importScreens(TEST_THEATER_ID)(theaterAdapter, screenAdapter);
        yield sskts.service.master.importFilms(TEST_THEATER_ID)(theaterAdapter, filmAdapter);
        yield sskts.service.master.importPerformances(TEST_THEATER_ID, tomorrow.format('YYYYMMDD'), tomorrow.format('YYYYMMDD'))(filmAdapter, screenAdapter, performanceAdapter);
        // パフォーマンスをひとつ取得して購入フローへ
        const performanceDoc = yield performanceAdapter.model.findOne({ day: tomorrow.format('YYYYMMDD') }).exec();
        if (performanceDoc === null) {
            throw new Error('performance tomorrow not foundF');
        }
        const makeInquiryResult = yield processTransactionByPerformance(performanceDoc.get(('id')));
        assert.equal(makeInquiryResult.type, 'transactions');
        assert.equal(typeof makeInquiryResult.id, 'string');
        assert.equal(makeInquiryResult.id, makeInquiryResult.attributes.id);
        assert.equal(makeInquiryResult.attributes.status, sskts.factory.transactionStatus.CLOSED);
    }));
});
/**
 * パフォーマンス指定で取引を進行する
 *
 * @param {string} performanceId パフォーマンスID
 * @returns {any} makeInquiryResult 取引照会結果
 */
// tslint:disable-next-line:max-func-body-length
function processTransactionByPerformance(performanceId) {
    return __awaiter(this, void 0, void 0, function* () {
        // アクセストークン取得
        const accessToken = yield supertest(app)
            .post('/oauth/token')
            .send({
            assertion: process.env.SSKTS_API_REFRESH_TOKEN,
            scope: 'admin'
        })
            .then((response) => {
            return response.body.access_token;
        });
        // パフォーマンス取得
        const performance = yield supertest(app)
            .get(`/performances/${performanceId}`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .then((response) => {
            if (response.status !== httpStatus.OK) {
                throw new Error(response.text);
            }
            return response.body.data.attributes;
        });
        // 作品取得
        const film = yield supertest(app)
            .get(`/films/${performance.film.id}`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .then((response) => {
            if (response.status !== httpStatus.OK) {
                throw new Error(response.text);
            }
            return response.body.data.attributes;
        });
        // スクリーン取得
        const screen = yield supertest(app)
            .get(`/screens/${performance.screen.id}`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .then((response) => {
            if (response.status !== httpStatus.OK) {
                throw new Error(response.text);
            }
            return response.body.data.attributes;
        });
        const theaterCode = performance.theater.id;
        const dateJouei = performance.day;
        const titleCode = film.coa_title_code;
        const titleBranchNum = film.coa_title_branch_num;
        const timeBegin = performance.time_start;
        const screenCode = screen.coa_screen_code;
        // 取引開始
        // 30分後のunix timestampを送信する場合
        // https://ja.wikipedia.org/wiki/UNIX%E6%99%82%E9%96%93
        const transaction = yield supertest(app)
            .post('/transactions/startIfPossible')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({
            expires_at: moment().add(30, 'minutes').unix() // tslint:disable-line:no-magic-numbers
        })
            .then((response) => {
            if (response.status === httpStatus.NOT_FOUND) {
                throw new Error('please try later');
            }
            if (response.status !== httpStatus.OK) {
                throw new Error(response.text);
            }
            return response.body.data;
        });
        const transactionId = transaction.id;
        const owners = transaction.attributes.owners;
        const promoterOwner = owners.find((owner) => {
            return (owner.group === 'PROMOTER');
        });
        const promoterOwnerId = (promoterOwner !== undefined) ? promoterOwner.id : null;
        const anonymousOwner = owners.find((owner) => {
            return (owner.group === 'ANONYMOUS');
        });
        const anonymousOwnerId = (anonymousOwner !== undefined) ? anonymousOwner.id : null;
        // 販売可能チケット検索
        const salesTicketResult = yield COA.ReserveService.salesTicket({
            theater_code: theaterCode,
            date_jouei: dateJouei,
            title_code: titleCode,
            title_branch_num: titleBranchNum,
            time_begin: timeBegin
        });
        // COA空席確認
        const getStateReserveSeatResult = yield COA.ReserveService.stateReserveSeat({
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
        const reserveSeatsTemporarilyResult = yield COA.ReserveService.updTmpReserveSeat({
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
        const coaAuthorizationId = yield supertest(app)
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
            .then((response) => {
            if (response.status !== httpStatus.OK) {
                throw new Error(response.text);
            }
            return response.body.data.id;
        });
        // COA仮予約削除
        yield COA.ReserveService.delTmpReserve({
            theater_code: theaterCode,
            date_jouei: dateJouei,
            title_code: titleCode,
            title_branch_num: titleBranchNum,
            time_begin: timeBegin,
            // screen_code: screenCode,
            tmp_reserve_num: reserveSeatsTemporarilyResult.tmp_reserve_num
        });
        // COAオーソリ削除
        yield supertest(app)
            .del(`/transactions/${transactionId}/authorizations/${coaAuthorizationId}`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({})
            .then((response) => {
            if (response.status !== httpStatus.NO_CONTENT) {
                throw new Error(response.text);
            }
        });
        // GMOオーソリ取得
        let orderId = Date.now().toString();
        const entryTranResult = yield GMO.CreditService.entryTran({
            shopId: TEST_GMO_SHOP_ID,
            shopPass: TEST_GMO_SHOP_PASS,
            orderId: orderId,
            jobCd: GMO.Util.JOB_CD_AUTH,
            amount: totalPrice
        });
        yield GMO.CreditService.execTran({
            accessId: entryTranResult.accessId,
            accessPass: entryTranResult.accessPass,
            orderId: orderId,
            method: '1',
            cardNo: '4111111111111111',
            expire: '2012',
            securityCode: '123'
        });
        // GMOオーソリ追加
        const gmoAuthorizationId = yield supertest(app)
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
            gmo_job_cd: GMO.Util.JOB_CD_AUTH,
            gmo_pay_type: GMO.Util.PAY_TYPE_CREDIT
        })
            .then((response) => {
            if (response.status !== httpStatus.OK) {
                throw new Error(response.text);
            }
            return response.body.data.id;
        });
        // GMOオーソリ取消
        yield GMO.CreditService.alterTran({
            shopId: TEST_GMO_SHOP_ID,
            shopPass: TEST_GMO_SHOP_PASS,
            accessId: entryTranResult.accessId,
            accessPass: entryTranResult.accessPass,
            jobCd: GMO.Util.JOB_CD_VOID
        });
        // GMOオーソリ削除
        yield supertest(app)
            .del(`/transactions/${transactionId}/authorizations/${gmoAuthorizationId}`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({})
            .then((response) => {
            if (response.status !== httpStatus.NO_CONTENT) {
                throw new Error(response.text);
            }
        });
        // COA仮予約2回目
        const reserveSeatsTemporarilyResult2 = yield COA.ReserveService.updTmpReserveSeat({
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
        yield supertest(app)
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
            .then((response) => {
            if (response.status !== httpStatus.OK) {
                throw new Error(response.text);
            }
        });
        // GMOオーソリ取得(2回目)
        orderId = Date.now().toString();
        const entryTranResult2 = yield GMO.CreditService.entryTran({
            shopId: TEST_GMO_SHOP_ID,
            shopPass: TEST_GMO_SHOP_PASS,
            orderId: orderId,
            jobCd: GMO.Util.JOB_CD_AUTH,
            amount: totalPrice
        });
        yield GMO.CreditService.execTran({
            accessId: entryTranResult2.accessId,
            accessPass: entryTranResult2.accessPass,
            orderId: orderId,
            method: '1',
            cardNo: '4111111111111111',
            expire: '2012',
            securityCode: '123'
        });
        // GMOオーソリ追加
        yield supertest(app)
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
            gmo_job_cd: GMO.Util.JOB_CD_AUTH,
            gmo_pay_type: GMO.Util.PAY_TYPE_CREDIT
        })
            .then((response) => {
            if (response.status !== httpStatus.OK) {
                throw new Error(response.text);
            }
        });
        // 購入者情報登録
        yield supertest(app)
            .patch(`/transactions/${transactionId}/anonymousOwner`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({
            name_first: TEST_OWNER.name_first,
            name_last: TEST_OWNER.name_last,
            tel: TEST_OWNER.tel,
            email: TEST_OWNER.email
        })
            .then((response) => {
            if (response.status !== httpStatus.NO_CONTENT) {
                throw new Error(response.text);
            }
        });
        // 照会情報登録(購入番号と電話番号で照会する場合)
        yield supertest(app)
            .patch(`/transactions/${transactionId}/enableInquiry`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({
            inquiry_theater: theaterCode,
            inquiry_id: reserveSeatsTemporarilyResult2.tmp_reserve_num,
            inquiry_pass: TEST_OWNER.tel
        })
            .then((response) => {
            if (response.status !== httpStatus.NO_CONTENT) {
                throw new Error(response.text);
            }
        });
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
◆電話番号 ：${TEST_OWNER.tel}\n
◆合計金額 ：${totalPrice}円\n
\n
※このアドレスは送信専用です。返信はできませんのであらかじめご了承下さい。\n
-------------------------------------------------------------------\n
シネマサンシャイン\n
http://www.cinemasunshine.co.jp/\n
-------------------------------------------------------------------\n
`;
        const notificationId = yield supertest(app)
            .post(`/transactions/${transactionId}/notifications/email`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({
            from: 'noreply@example.com',
            to: process.env.SSKTS_DEVELOPER_EMAIL,
            subject: '購入完了',
            content: content
        })
            .then((response) => {
            if (response.status !== httpStatus.OK) {
                throw new Error(response.text);
            }
            return response.body.data.id;
        });
        // メール削除
        yield supertest(app)
            .del(`/transactions/${transactionId}/notifications/${notificationId}`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({})
            .then((response) => {
            if (response.status !== httpStatus.NO_CONTENT) {
                throw new Error(response.text);
            }
        });
        // 再度メール追加
        yield supertest(app)
            .post(`/transactions/${transactionId}/notifications/email`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({
            from: 'noreply@example.com',
            to: process.env.SSKTS_DEVELOPER_EMAIL,
            subject: '購入完了',
            content: content
        })
            .then((response) => {
            if (response.status !== httpStatus.OK) {
                throw new Error(response.text);
            }
        });
        // 取引成立
        yield supertest(app)
            .patch(`/transactions/${transactionId}/close`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({})
            .then((response) => {
            if (response.status !== httpStatus.NO_CONTENT) {
                throw new Error(response.text);
            }
        });
        // 照会してみる
        return yield supertest(app)
            .post('/transactions/makeInquiry')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({
            inquiry_theater: theaterCode,
            inquiry_id: reserveSeatsTemporarilyResult2.tmp_reserve_num,
            inquiry_pass: TEST_OWNER.tel
        })
            .then((response) => {
            if (response.status === httpStatus.NOT_FOUND) {
                throw new Error('transaction not found');
            }
            if (response.status !== httpStatus.OK) {
                throw new Error(response.text);
            }
            return response.body.data;
        });
    });
}
