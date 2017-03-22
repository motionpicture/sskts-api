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
 * 取引フローテストスクリプト
 *
 * @ignore
 */
const COA = require("@motionpicture/coa-service");
const GMO = require("@motionpicture/gmo-service");
const createDebug = require("debug");
const httpStatus = require("http-status");
const moment = require("moment");
const request = require("request-promise-native");
const debug = createDebug('*');
const API_ENDPOINT = 'http://localhost:8080'; // tslint:disable-line:no-http-string
// const API_ENDPOINT = 'https://devssktsapi-staging.azurewebsites.net'; // tslint:disable-line:no-http-string
// tslint:disable-next-line:max-func-body-length cyclomatic-complexity
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let response;
        const gmoShopId = 'tshop00026096';
        const gmoShopPass = 'xbxmkaa6';
        const performanceId = '11820170323162270802120'; // パフォーマンスID 空席なくなったら変更する
        // アクセストークン取得
        response = yield request.post({
            url: `${API_ENDPOINT}/oauth/token`,
            body: {
                assertion: process.env.SSKTS_API_REFRESH_TOKEN,
                scope: 'admin'
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });
        debug('oauth token result:', response.statusCode, response.body);
        const accessToken = response.body.access_token;
        // パフォーマンス取得
        debug('finding performance...');
        response = yield request.get({
            url: `${API_ENDPOINT}/performances/` + performanceId,
            auth: { bearer: accessToken },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });
        debug('/performances/:id result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(response.body.message);
        }
        const performance = response.body.data.attributes;
        // 作品取得
        debug('finding film...');
        response = yield request.get({
            url: `${API_ENDPOINT}/films/` + performance.film.id,
            auth: { bearer: accessToken },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });
        debug('/films/:id result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(response.body.message);
        }
        const film = response.body.data.attributes;
        // スクリーン取得
        debug('finding screen...');
        response = yield request.get({
            url: `${API_ENDPOINT}/screens/` + performance.screen.id,
            auth: { bearer: accessToken },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });
        debug('/screens/:id result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(response.body.message);
        }
        const screen = response.body.data.attributes;
        const theaterCode = performance.theater.id;
        const dateJouei = performance.day;
        const titleCode = film.coa_title_code;
        const titleBranchNum = film.coa_title_branch_num;
        const timeBegin = performance.time_start;
        const screenCode = screen.coa_screen_code;
        // 取引開始
        // 30分後のunix timestampを送信する場合
        // https://ja.wikipedia.org/wiki/UNIX%E6%99%82%E9%96%93
        debug('starting transaction...');
        response = yield request.post({
            url: `${API_ENDPOINT}/transactions/startIfPossible`,
            auth: { bearer: accessToken },
            body: {
                expires_at: moment().add(30, 'minutes').unix() // tslint:disable-line:no-magic-numbers
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });
        debug('transaction start result:', response.statusCode, response.body);
        if (response.statusCode === httpStatus.NOT_FOUND) {
            throw new Error('please try later');
        }
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(response.body.message);
        }
        const transactionId = response.body.data.id;
        const owners = response.body.data.attributes.owners;
        const promoterOwner = owners.find((owner) => {
            return (owner.group === 'PROMOTER');
        });
        const promoterOwnerId = (promoterOwner) ? promoterOwner.id : null;
        const anonymousOwner = owners.find((owner) => {
            return (owner.group === 'ANONYMOUS');
        });
        const anonymousOwnerId = (anonymousOwner) ? anonymousOwner.id : null;
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
        debug('getStateReserveSeatResult is', getStateReserveSeatResult);
        const sectionCode = getStateReserveSeatResult.list_seat[0].seat_section;
        const freeSeatCodes = getStateReserveSeatResult.list_seat[0].list_free_seat.map((freeSeat) => {
            return freeSeat.seat_num;
        });
        debug('freeSeatCodes count', freeSeatCodes.length);
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
                }, {
                    seat_section: sectionCode,
                    seat_num: freeSeatCodes[1]
                }]
        });
        debug(reserveSeatsTemporarilyResult);
        // COAオーソリ追加
        debug('adding authorizations coaSeatReservation...');
        const totalPrice = salesTicketResult[0].sale_price + salesTicketResult[0].sale_price;
        response = yield request.post({
            url: `${API_ENDPOINT}/transactions/${transactionId}/authorizations/coaSeatReservation`,
            auth: { bearer: accessToken },
            body: {
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
                        section: tmpReserve.seat_section,
                        seat_code: tmpReserve.seat_num,
                        ticket_code: salesTicketResult[0].ticket_code,
                        ticket_name_ja: salesTicketResult[0].ticket_name,
                        ticket_name_en: salesTicketResult[0].ticket_name_eng,
                        ticket_name_kana: salesTicketResult[0].ticket_name_kana,
                        std_price: salesTicketResult[0].std_price,
                        add_price: salesTicketResult[0].add_price,
                        dis_price: 0,
                        sale_price: salesTicketResult[0].sale_price
                    };
                }),
                price: totalPrice
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });
        debug('addCOASeatReservationAuthorization result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(response.body.message);
        }
        const coaAuthorizationId = response.body.data.id;
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
        debug('deconsteTmpReserveResult:', true);
        // COAオーソリ削除
        debug('removing authorizations coaSeatReservation...');
        response = yield request.del({
            url: `${API_ENDPOINT}/transactions/${transactionId}/authorizations/${coaAuthorizationId}`,
            auth: { bearer: accessToken },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });
        debug('removeCOASeatReservationAuthorization result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.NO_CONTENT) {
            throw new Error(response.body.message);
        }
        // GMOオーソリ取得
        let orderId = Date.now().toString();
        const entryTranResult = yield GMO.CreditService.entryTran({
            shopId: gmoShopId,
            shopPass: gmoShopPass,
            orderId: orderId,
            jobCd: GMO.Util.JOB_CD_AUTH,
            amount: totalPrice
        });
        const execTranResult = yield GMO.CreditService.execTran({
            accessId: entryTranResult.accessId,
            accessPass: entryTranResult.accessPass,
            orderId: orderId,
            method: '1',
            cardNo: '4111111111111111',
            expire: '2012',
            securityCode: '123'
        });
        debug(execTranResult);
        // GMOオーソリ追加
        debug('adding authorizations gmo...');
        response = yield request.post({
            url: `${API_ENDPOINT}/transactions/${transactionId}/authorizations/gmo`,
            auth: { bearer: accessToken },
            body: {
                owner_from: anonymousOwnerId,
                owner_to: promoterOwnerId,
                gmo_shop_id: gmoShopId,
                gmo_shop_pass: gmoShopPass,
                gmo_order_id: orderId,
                gmo_amount: totalPrice,
                gmo_access_id: entryTranResult.accessId,
                gmo_access_pass: entryTranResult.accessPass,
                gmo_job_cd: GMO.Util.JOB_CD_AUTH,
                gmo_pay_type: GMO.Util.PAY_TYPE_CREDIT
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });
        debug('addGMOAuthorization result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(response.body.message);
        }
        const gmoAuthorizationId = response.body.data.id;
        // GMOオーソリ取消
        const alterTranResult = yield GMO.CreditService.alterTran({
            shopId: gmoShopId,
            shopPass: gmoShopPass,
            accessId: entryTranResult.accessId,
            accessPass: entryTranResult.accessPass,
            jobCd: GMO.Util.JOB_CD_VOID
        });
        debug('alterTranResult:', alterTranResult);
        // GMOオーソリ削除
        debug('removing authorizations gmo...');
        response = yield request.del({
            url: `${API_ENDPOINT}/transactions/${transactionId}/authorizations/${gmoAuthorizationId}`,
            auth: { bearer: accessToken },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });
        debug('removeGMOAuthorization result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.NO_CONTENT) {
            throw new Error(response.body.message);
        }
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
                }, {
                    seat_section: sectionCode,
                    seat_num: freeSeatCodes[1]
                }]
        });
        debug('reserveSeatsTemporarilyResult2:', reserveSeatsTemporarilyResult2);
        // COAオーソリ追加
        debug('adding authorizations coaSeatReservation...');
        response = yield request.post({
            url: `${API_ENDPOINT}/transactions/${transactionId}/authorizations/coaSeatReservation`,
            auth: { bearer: accessToken },
            body: {
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
                        section: tmpReserve.seat_section,
                        seat_code: tmpReserve.seat_num,
                        ticket_code: salesTicketResult[0].ticket_code,
                        ticket_name_ja: salesTicketResult[0].ticket_name,
                        ticket_name_en: salesTicketResult[0].ticket_name_eng,
                        ticket_name_kana: salesTicketResult[0].ticket_name_kana,
                        std_price: salesTicketResult[0].std_price,
                        add_price: salesTicketResult[0].add_price,
                        dis_price: 0,
                        sale_price: salesTicketResult[0].sale_price
                    };
                }),
                price: totalPrice
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });
        debug('addCOASeatReservationAuthorization result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(response.body.message);
        }
        // GMOオーソリ取得(2回目)
        orderId = Date.now().toString();
        const entryTranResult2 = yield GMO.CreditService.entryTran({
            shopId: gmoShopId,
            shopPass: gmoShopPass,
            orderId: orderId,
            jobCd: GMO.Util.JOB_CD_AUTH,
            amount: totalPrice
        });
        const execTranResult2 = yield GMO.CreditService.execTran({
            accessId: entryTranResult2.accessId,
            accessPass: entryTranResult2.accessPass,
            orderId: orderId,
            method: '1',
            cardNo: '4111111111111111',
            expire: '2012',
            securityCode: '123'
        });
        debug('execTranResult2:', execTranResult2);
        // GMOオーソリ追加
        debug('adding authorizations gmo...');
        response = yield request.post({
            url: `${API_ENDPOINT}/transactions/${transactionId}/authorizations/gmo`,
            auth: { bearer: accessToken },
            body: {
                owner_from: anonymousOwnerId,
                owner_to: promoterOwnerId,
                gmo_shop_id: gmoShopId,
                gmo_shop_pass: gmoShopPass,
                gmo_order_id: orderId,
                gmo_amount: totalPrice,
                gmo_access_id: entryTranResult2.accessId,
                gmo_access_pass: entryTranResult2.accessPass,
                gmo_job_cd: GMO.Util.JOB_CD_AUTH,
                gmo_pay_type: GMO.Util.PAY_TYPE_CREDIT
            },
            json: true,
            resolveWithFullResponse: true
        });
        debug('addGMOAuthorization result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(response.body.message);
        }
        // 購入者情報登録
        debug('updating anonymous...');
        response = yield request.patch({
            url: `${API_ENDPOINT}/transactions/${transactionId}/anonymousOwner`,
            auth: { bearer: accessToken },
            body: {
                name_first: 'Tetsu',
                name_last: 'Yamazaki',
                tel: '09012345678',
                email: process.env.SSKTS_DEVELOPER_EMAIL
            },
            json: true,
            resolveWithFullResponse: true
        });
        debug('anonymousOwner updated.', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.NO_CONTENT) {
            throw new Error(response.body.message);
        }
        // COA本予約
        const tel = '09012345678';
        const updateReserveResult = yield COA.ReserveService.updReserve({
            theater_code: theaterCode,
            date_jouei: dateJouei,
            title_code: titleCode,
            title_branch_num: titleBranchNum,
            time_begin: timeBegin,
            // screen_code: screenCode,
            tmp_reserve_num: reserveSeatsTemporarilyResult2.tmp_reserve_num,
            reserve_name: '山崎 哲',
            reserve_name_jkana: 'ヤマザキ テツ',
            tel_num: '09012345678',
            mail_addr: 'yamazaki@motionpicture.jp',
            reserve_amount: totalPrice,
            list_ticket: reserveSeatsTemporarilyResult2.list_tmp_reserve.map((tmpReserve) => {
                return {
                    ticket_code: salesTicketResult[0].ticket_code,
                    std_price: salesTicketResult[0].std_price,
                    add_price: salesTicketResult[0].add_price,
                    dis_price: 0,
                    sale_price: salesTicketResult[0].sale_price,
                    mvtk_app_price: 0,
                    ticket_count: 1,
                    seat_num: tmpReserve.seat_num,
                    add_glasses: 0
                };
            })
        });
        debug('updateReserveResult:', updateReserveResult);
        // 照会情報登録(購入番号と電話番号で照会する場合)
        debug('enabling inquiry...');
        response = yield request.patch({
            url: `${API_ENDPOINT}/transactions/${transactionId}/enableInquiry`,
            auth: { bearer: accessToken },
            body: {
                inquiry_theater: theaterCode,
                inquiry_id: updateReserveResult.reserve_num,
                inquiry_pass: tel
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });
        debug('enableInquiry result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.NO_CONTENT) {
            throw new Error(response.body.message);
        }
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
◆購入番号 ：${updateReserveResult.reserve_num}\n
◆電話番号 ：09012345678\n
◆合計金額 ：${totalPrice}円\n
\n
※このアドレスは送信専用です。返信はできませんのであらかじめご了承下さい。\n
-------------------------------------------------------------------\n
シネマサンシャイン\n
http://www.cinemasunshine.co.jp/\n
-------------------------------------------------------------------\n
`;
        debug('adding email...');
        response = yield request.post({
            url: `${API_ENDPOINT}/transactions/${transactionId}/notifications/email`,
            auth: { bearer: accessToken },
            body: {
                from: 'noreply@localhost',
                to: process.env.SSKTS_DEVELOPER_EMAIL,
                subject: '購入完了',
                content: content
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });
        debug('addEmail result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(response.body.message);
        }
        const notificationId = response.body.data.id;
        // メール削除
        debug('removing email...');
        response = yield request.del({
            url: `${API_ENDPOINT}/transactions/${transactionId}/notifications/${notificationId}`,
            auth: { bearer: accessToken },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });
        debug('removeEmail result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.NO_CONTENT) {
            throw new Error(response.body.message);
        }
        // 再度メール追加
        debug('adding email...');
        response = yield request.post({
            url: `${API_ENDPOINT}/transactions/${transactionId}/notifications/email`,
            auth: { bearer: accessToken },
            body: {
                from: 'noreply@localhost',
                to: process.env.SSKTS_DEVELOPER_EMAIL,
                subject: '購入完了',
                content: content
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });
        debug('addEmail result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(response.body.message);
        }
        // 取引成立
        debug('closing transaction...');
        response = yield request.patch({
            url: `${API_ENDPOINT}/transactions/${transactionId}/close`,
            auth: { bearer: accessToken },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });
        debug('close result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.NO_CONTENT) {
            throw new Error(response.body.message);
        }
        // 照会してみる
        response = yield request.post({
            url: `${API_ENDPOINT}/transactions/makeInquiry`,
            auth: { bearer: accessToken },
            body: {
                inquiry_theater: theaterCode,
                inquiry_id: updateReserveResult.reserve_num,
                inquiry_pass: tel
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });
        debug('makeInquiry result:', response.statusCode, response.body);
    });
}
main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
