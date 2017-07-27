"use strict";
/**
 * ムビチケを使って購入する注文取引プロセスサンプル
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
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const httpStatus = require("http-status");
const moment = require("moment");
const request = require("request-promise-native");
const Scenarios = require("../scenarios");
const debug = createDebug('sskts-api:examples');
const API_ENDPOINT = process.env.TEST_API_ENDPOINT;
// tslint:disable-next-line:max-func-body-length cyclomatic-complexity
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let response;
        const performanceId = '11820170331170190502020'; // パフォーマンスID 空席なくなったら変更する
        // アクセストークン取得
        const auth = new Scenarios.OAuth2(process.env.SSKTS_API_REFRESH_TOKEN, ['admin']);
        // パフォーマンス取得
        debug('finding performance...');
        response = yield request.get({
            url: `${API_ENDPOINT}/performances/${performanceId}`,
            auth: { bearer: yield auth.getAccessToken() },
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
            url: `${API_ENDPOINT}/films/${performance.film.id}`,
            auth: { bearer: yield auth.getAccessToken() },
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
            url: `${API_ENDPOINT}/screens/${performance.screen.id}`,
            auth: { bearer: yield auth.getAccessToken() },
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
            auth: { bearer: yield auth.getAccessToken() },
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
        const salesTicketResult = yield sskts.COA.services.reserve.salesTicket({
            theaterCode: theaterCode,
            dateJouei: dateJouei,
            titleCode: titleCode,
            titleBranchNum: titleBranchNum,
            timeBegin: timeBegin,
            flgMember: sskts.COA.services.reserve.FlgMember.NonMember
        });
        // COA空席確認
        const getStateReserveSeatResult = yield sskts.COA.services.reserve.stateReserveSeat({
            theaterCode: theaterCode,
            dateJouei: dateJouei,
            titleCode: titleCode,
            titleBranchNum: titleBranchNum,
            timeBegin: timeBegin,
            screenCode: screenCode
        });
        debug('getStateReserveSeatResult is', getStateReserveSeatResult);
        const sectionCode = getStateReserveSeatResult.listSeat[0].seatSection;
        const freeSeatCodes = getStateReserveSeatResult.listSeat[0].listFreeSeat.map((freeSeat) => {
            return freeSeat.seatNum;
        });
        debug('freeSeatCodes count', freeSeatCodes.length);
        if (getStateReserveSeatResult.cntReserveFree === 0) {
            throw new Error('no available seats.');
        }
        // COA仮予約
        const reserveSeatsTemporarilyResult = yield sskts.COA.services.reserve.updTmpReserveSeat({
            theaterCode: theaterCode,
            dateJouei: dateJouei,
            titleCode: titleCode,
            titleBranchNum: titleBranchNum,
            timeBegin: timeBegin,
            screenCode: screenCode,
            listSeat: [{
                    seatSection: sectionCode,
                    seatNum: freeSeatCodes[0]
                }, {
                    seatSection: sectionCode,
                    seatNum: freeSeatCodes[1]
                }]
        });
        debug(reserveSeatsTemporarilyResult);
        // COAオーソリ追加
        debug('adding authorizations coaSeatReservation...');
        const totalPrice = salesTicketResult[0].salePrice + salesTicketResult[0].salePrice;
        response = yield request.post({
            url: `${API_ENDPOINT}/transactions/${transactionId}/authorizations/coaSeatReservation`,
            auth: { bearer: yield auth.getAccessToken() },
            body: {
                owner_from: promoterOwnerId,
                owner_to: anonymousOwnerId,
                coa_tmpReserveNum: reserveSeatsTemporarilyResult.tmpReserveNum,
                coa_theater_code: theaterCode,
                coa_date_jouei: dateJouei,
                coa_title_code: titleCode,
                coa_title_branch_num: titleBranchNum,
                coa_time_begin: timeBegin,
                coa_screen_code: screenCode,
                seats: reserveSeatsTemporarilyResult.listTmpReserve.map((tmpReserve) => {
                    return {
                        performance: performance.id,
                        screen_section: tmpReserve.seatSection,
                        seat_code: tmpReserve.seatNum,
                        ticket_code: salesTicketResult[0].ticketCode,
                        ticket_name: {
                            ja: salesTicketResult[0].ticketName,
                            en: salesTicketResult[0].ticketNameEng
                        },
                        ticket_name_kana: salesTicketResult[0].ticketNameKana,
                        std_price: salesTicketResult[0].stdPrice,
                        add_price: salesTicketResult[0].addPrice,
                        dis_price: 0,
                        sale_price: salesTicketResult[0].salePrice,
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
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });
        debug('addCOASeatReservationAuthorization result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(response.body.message);
        }
        // const coaAuthorizationId = response.body.data.id;
        // 購入者情報登録
        debug('updating anonymous...');
        const tel = '09012345678';
        response = yield request.patch({
            url: `${API_ENDPOINT}/transactions/${transactionId}/anonymousOwner`,
            auth: { bearer: yield auth.getAccessToken() },
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
        // COA本予約
        // const updateReserveResult = await sskts.COA.ReserveService.updReserve({
        //     theater_code: theaterCode,
        //     date_jouei: dateJouei,
        //     title_code: titleCode,
        //     title_branch_num: titleBranchNum,
        //     time_begin: timeBegin,
        //     // screen_code: screenCode,
        //     tmpReserveNum: reserveSeatsTemporarilyResult.tmpReserveNum,
        //     reserve_name: '山崎 哲',
        //     reserve_name_jkana: 'ヤマザキ テツ',
        //     tel_num: '09012345678',
        //     mail_addr: 'yamazaki@motionpicture.jp',
        //     reserve_amount: totalPrice,
        //     list_ticket: reserveSeatsTemporarilyResult.list_tmp_reserve.map((tmpReserve) => {
        //         return {
        //             ticket_code: salesTicketResult[0].ticket_code,
        //             std_price: salesTicketResult[0].std_price,
        //             add_price: salesTicketResult[0].add_price,
        //             dis_price: 0,
        //             sale_price: salesTicketResult[0].sale_price,
        //             mvtk_app_price: 0,
        //             ticket_count: 1,
        //             seat_num: tmpReserve.seat_num,
        //             add_glasses: 0
        //         };
        //     })
        // });
        // debug('updateReserveResult:', updateReserveResult);
        // 本当はここでムビチケ着券処理
        // ムビチケオーソリ追加(着券した体で) 値はほぼ適当です
        debug('adding authorizations mvtk...');
        response = yield request.post({
            url: `${API_ENDPOINT}/transactions/${transactionId}/authorizations/mvtk`,
            auth: { bearer: yield auth.getAccessToken() },
            body: {
                owner_from: anonymousOwnerId,
                owner_to: promoterOwnerId,
                price: totalPrice,
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
                zsk_info: reserveSeatsTemporarilyResult.listTmpReserve.map((tmpReserve) => {
                    return { zsk_cd: tmpReserve.seatNum };
                }),
                skhn_cd: '1622700'
            },
            json: true,
            resolveWithFullResponse: true
        });
        debug('addMvtkAuthorization result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(response.body.message);
        }
        // 照会情報登録(購入番号と電話番号で照会する場合)
        debug('enabling inquiry...');
        response = yield request.patch({
            url: `${API_ENDPOINT}/transactions/${transactionId}/enableInquiry`,
            auth: { bearer: yield auth.getAccessToken() },
            body: {
                inquiry_theater: theaterCode,
                inquiry_id: reserveSeatsTemporarilyResult.tmpReserveNum,
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
◆購入番号 ：${reserveSeatsTemporarilyResult.tmpReserveNum}\n
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
            auth: { bearer: yield auth.getAccessToken() },
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
        // const notificationId = response.body.data.id;
        // 取引成立
        debug('closing transaction...');
        response = yield request.patch({
            url: `${API_ENDPOINT}/transactions/${transactionId}/close`,
            auth: { bearer: yield auth.getAccessToken() },
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
            auth: { bearer: yield auth.getAccessToken() },
            body: {
                inquiry_theater: theaterCode,
                inquiry_id: reserveSeatsTemporarilyResult.tmpReserveNum,
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
