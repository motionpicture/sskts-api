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
// tslint:disable-next-line:missing-jsdoc
const COA = require("@motionpicture/coa-service");
const GMO = require("@motionpicture/gmo-service");
const createDebug = require("debug");
const moment = require("moment");
const request = require("request-promise-native");
const debug = createDebug('*');
let count = 0;
const MAX_NUMBER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 1000;
setInterval(() => __awaiter(this, void 0, void 0, function* () {
    if (count > MAX_NUMBER_OF_PARALLEL_TASKS) {
        return;
    }
    count += 1;
    try {
        yield execute();
    }
    catch (error) {
        console.error(error.message);
    }
    count -= 1;
}), INTERVAL_MILLISECONDS);
// tslint:disable-next-line:max-func-body-length
function execute() {
    return __awaiter(this, void 0, void 0, function* () {
        let response;
        const gmoShopId = 'tshop00026096';
        const gmoShopPass = 'xbxmkaa6';
        // アクセストークン取得
        response = yield request.post({
            // tslint:disable-next-line:no-http-string
            url: 'http://localhost:8080/oauth/token',
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
        // 取引開始
        // https://ja.wikipedia.org/wiki/UNIX%E6%99%82%E9%96%93
        debug('starting transaction...');
        response = yield request.post({
            // tslint:disable-next-line:no-http-string
            url: 'http://localhost:8080/transactions',
            auth: { bearer: accessToken },
            body: {
                expired_at: moment().add(1, 'minutes').unix()
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });
        debug('/transactions/start result:', response.statusCode, response.body);
        // tslint:disable-next-line:no-magic-numbers
        if (response.statusCode !== 201) {
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
        // 空席なくなったら変更する
        const theaterCode = '118';
        const dateJouei = '20170228';
        const titleCode = '16404';
        const titleBranchNum = '0';
        const timeBegin = '0920';
        const screenCode = '8';
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
            url: `http://localhost:8080/transactions/${transactionId}/authorizations/coaSeatReservation`,
            auth: { bearer: accessToken },
            body: {
                owner_id_from: promoterOwnerId,
                owner_id_to: anonymousOwnerId,
                coa_tmp_reserve_num: reserveSeatsTemporarilyResult.tmp_reserve_num,
                coa_theater_code: theaterCode,
                coa_date_jouei: dateJouei,
                coa_title_code: titleCode,
                coa_title_branch_num: titleBranchNum,
                coa_time_begin: timeBegin,
                coa_screen_code: screenCode,
                seats: reserveSeatsTemporarilyResult.list_tmp_reserve.map((tmpReserve) => {
                    return {
                        performance: '001201701208513021010',
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
        // tslint:disable-next-line:no-magic-numbers
        if (response.statusCode !== 200) {
            throw new Error(response.body.message);
        }
        // GMOオーソリ取得
        const orderId = Date.now().toString();
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
            url: `http://localhost:8080/transactions/${transactionId}/authorizations/gmo`,
            auth: { bearer: accessToken },
            body: {
                owner_id_from: anonymousOwnerId,
                owner_id_to: promoterOwnerId,
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
        // tslint:disable-next-line:no-magic-numbers
        if (response.statusCode !== 200) {
            throw new Error(response.body.message);
        }
    });
}
