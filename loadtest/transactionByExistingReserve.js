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
 * すでに存在している座席予約を使った取引フローテストスクリプト
 * 運用ではありえない状況
 * シナリオテストに使うためのものです
 *
 * @ignore
 */
const GMO = require("@motionpicture/gmo-service");
const createDebug = require("debug");
const httpStatus = require("http-status");
const moment = require("moment");
const request = require("request-promise-native");
const winston = require("winston");
const debug = createDebug('sskts-api:examples:transactionByExistingReserve');
const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: true,
            level: 'info'
        }),
        new (winston.transports.File)({
            filename: `transactionByExistingReserve-${moment().format('YYYYMMDDHHmmss')}.log`,
            timestamp: true,
            level: 'info',
            json: false
        })
    ]
});
const API_ENDPOINT = process.env.TEST_API_ENDPOINT;
function tryAuthGMO(gmoShopId, gmoShopPass, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = null;
        while (result === null) {
            try {
                // GMOオーソリ取得
                const orderId = Date.now().toString();
                const entryTranResult = yield GMO.CreditService.entryTran({
                    shopId: gmoShopId,
                    shopPass: gmoShopPass,
                    orderId: orderId,
                    jobCd: GMO.Util.JOB_CD_AUTH,
                    amount: amount
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
                result = {
                    orderId: orderId,
                    accessId: entryTranResult.accessId,
                    accessPass: entryTranResult.accessPass
                };
            }
            catch (error) {
                debug(error);
            }
        }
        return result;
    });
}
// tslint:disable-next-line:max-func-body-length
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let response;
        const gmoShopId = 'tshop00026096';
        const gmoShopPass = 'xbxmkaa6';
        const theaterCode = '118';
        const reserveNum = 1381;
        const tel = '09012345678';
        const totalPrice = 2600;
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
        // 取引開始
        debug('starting transaction...');
        response = yield request.post({
            url: `${API_ENDPOINT}/transactions/startIfPossible`,
            auth: { bearer: accessToken },
            body: {
                expires_at: moment().add(15, 'minutes').unix() // tslint:disable-line:no-magic-numbers
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
        // COAオーソリ追加
        debug('adding authorizations coaSeatReservation...');
        response = yield request.post({
            url: `${API_ENDPOINT}/transactions/${transactionId}/authorizations/coaSeatReservation`,
            auth: { bearer: accessToken },
            body: {
                seats: [
                    {
                        kbn_eisyahousiki: '00',
                        add_glasses: 0,
                        mvtk_app_price: 0,
                        sale_price: 1300,
                        dis_price: 0,
                        add_price: 0,
                        std_price: 1300,
                        ticket_name_kana: 'レイトショー',
                        ticket_name_en: 'Late Show Price',
                        ticket_name_ja: 'レイト',
                        ticket_code: '171',
                        seat_code: 'Ｂ－３',
                        section: '   ',
                        performance: '11820170410162500902130'
                    },
                    {
                        kbn_eisyahousiki: '00',
                        add_glasses: 0,
                        mvtk_app_price: 0,
                        sale_price: 1300,
                        dis_price: 0,
                        add_price: 0,
                        std_price: 1300,
                        ticket_name_kana: 'レイトショー',
                        ticket_name_en: 'Late Show Price',
                        ticket_name_ja: 'レイト',
                        ticket_code: '171',
                        seat_code: 'Ｂ－４',
                        section: '   ',
                        performance: '11820170410162500902130'
                    }
                ],
                owner_to: anonymousOwnerId,
                owner_from: '5868e16789cc75249cdbfa4b',
                price: totalPrice,
                coa_screen_code: '90',
                coa_time_begin: '2130',
                coa_title_branch_num: '0',
                coa_title_code: '16250',
                coa_date_jouei: '20170410',
                coa_theater_code: theaterCode,
                coa_tmp_reserve_num: reserveNum
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });
        debug('addCOASeatReservationAuthorization result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(response.body.message);
        }
        // GMOオーソリ取得(できるまで続ける)
        const tryAuthGMOResult = yield tryAuthGMO(gmoShopId, gmoShopPass, totalPrice);
        const orderId = tryAuthGMOResult.orderId;
        const accessId = tryAuthGMOResult.accessId;
        const accessPass = tryAuthGMOResult.accessPass;
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
                gmo_access_id: accessId,
                gmo_access_pass: accessPass,
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
        // 購入者情報登録
        debug('updating anonymous...');
        response = yield request.patch({
            url: `${API_ENDPOINT}/transactions/${transactionId}/anonymousOwner`,
            auth: { bearer: accessToken },
            body: {
                name_first: 'Tetsu',
                name_last: 'Yamazaki',
                tel: tel,
                email: process.env.SSKTS_DEVELOPER_EMAIL
            },
            json: true,
            resolveWithFullResponse: true
        });
        debug('anonymousOwner updated.', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.NO_CONTENT) {
            throw new Error(response.body.message);
        }
        // 照会情報登録(購入番号と電話番号で照会する場合)
        debug('enabling inquiry...');
        response = yield request.patch({
            url: `${API_ENDPOINT}/transactions/${transactionId}/enableInquiry`,
            auth: { bearer: accessToken },
            body: {
                inquiry_theater: theaterCode,
                inquiry_id: reserveNum,
                inquiry_pass: '00000000000' // 購入取消されないようにあえて間違った値
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
sskts-api:examples:transactionByExistingReserve 様\n
\n
-------------------------------------------------------------------\n
この度はご購入いただき誠にありがとうございます。\n
\n
※チケット発券時は、自動発券機に下記チケットQRコードをかざしていただくか、購入番号と電話番号を入力していただく必要があります。\n
-------------------------------------------------------------------\n
\n
◆購入番号 ：${reserveNum}\n
◆電話番号 ${tel}\n
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
                from: 'noreply@example.com',
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
    });
}
let count = 0;
let numberOfClosedTransactions = 0;
let numberOfProcessedTransactions = 0;
const MAX_NUBMER_OF_PARALLEL_TASKS = 1800;
const INTERVAL_MILLISECONDS = 500;
const timer = setInterval(() => __awaiter(this, void 0, void 0, function* () {
    if (count >= MAX_NUBMER_OF_PARALLEL_TASKS) {
        clearTimeout(timer);
        return;
    }
    count += 1;
    const countNow = count;
    try {
        logger.info('starting...', countNow);
        yield main();
        numberOfClosedTransactions += 1;
        logger.info('end', countNow);
    }
    catch (error) {
        logger.error(error.message, countNow);
    }
    numberOfProcessedTransactions += 1;
    logger.info('numberOfProcessedTransactions:', numberOfProcessedTransactions);
    // count -= 1;
}), INTERVAL_MILLISECONDS);
process.on('exit', () => {
    logger.info('numberOfClosedTransactions:', numberOfClosedTransactions);
});
