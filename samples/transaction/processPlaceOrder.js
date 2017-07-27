"use strict";
/**
 * 注文取引プロセスサンプル
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
const sskts_domain_1 = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const moment = require("moment");
const util = require("util");
const sskts = require("../lib/sskts-api");
const debug = createDebug('sskts-api:samples');
// tslint:disable-next-line:max-func-body-length
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = new sskts.auth.OAuth2('motionpicture', 'motionpicture', 'teststate', ['admin']);
        // 上映イベント検索
        const individualScreeningEvents = yield sskts.event.searchIndividualScreeningEvent({
            auth: auth,
            searchConditions: {
                theater: '118',
                day: moment().format('YYYYMMDD')
            }
        });
        // イベント情報取得
        const individualScreeningEvent = yield sskts.event.findIndividualScreeningEvent({
            auth: auth,
            identifier: individualScreeningEvents[0].identifier
        });
        // 劇場ショップ検索
        const movieTheaters = yield sskts.organization.searchMovieTheaters({
            auth: auth
        });
        const theaterCode = individualScreeningEvent.coaInfo.theaterCode;
        const dateJouei = individualScreeningEvent.coaInfo.dateJouei;
        const titleCode = individualScreeningEvent.coaInfo.titleCode;
        const titleBranchNum = individualScreeningEvent.coaInfo.titleBranchNum;
        const timeBegin = individualScreeningEvent.coaInfo.timeBegin;
        const screenCode = individualScreeningEvent.coaInfo.screenCode;
        // 劇場のショップを検索
        const seller = movieTheaters.find((movieTheater) => movieTheater.location.branchCode === theaterCode);
        // 取引開始
        // 1分後のunix timestampを送信する場合
        // https://ja.wikipedia.org/wiki/UNIX%E6%99%82%E9%96%93
        debug('starting transaction...');
        const transaction = yield sskts.transaction.placeOrder.start({
            auth: auth,
            expires: moment().add(1, 'minutes').toDate(),
            sellerId: seller.id
        });
        // 販売可能チケット検索
        const salesTicketResult = yield sskts_domain_1.COA.services.reserve.salesTicket({
            theaterCode: theaterCode,
            dateJouei: dateJouei,
            titleCode: titleCode,
            titleBranchNum: titleBranchNum,
            timeBegin: timeBegin,
            flgMember: sskts_domain_1.COA.services.reserve.FlgMember.NonMember
        });
        debug('salesTicketResult:', salesTicketResult);
        // COA空席確認
        const getStateReserveSeatResult = yield sskts_domain_1.COA.services.reserve.stateReserveSeat({
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
        // COAオーソリ追加
        debug('authorizing seat reservation...');
        const totalPrice = salesTicketResult[0].salePrice;
        const seatReservationAuthorization = yield sskts.transaction.placeOrder.createSeatReservationAuthorization({
            auth: auth,
            transactionId: transaction.id,
            eventIdentifier: individualScreeningEvent.identifier,
            offers: [
                {
                    seatSection: sectionCode,
                    seatNumber: freeSeatCodes[0],
                    ticket: {
                        ticketCode: salesTicketResult[0].ticketCode,
                        stdPrice: salesTicketResult[0].stdPrice,
                        addPrice: salesTicketResult[0].addPrice,
                        disPrice: 0,
                        salePrice: salesTicketResult[0].salePrice,
                        mvtkAppPrice: 0,
                        ticketCount: 1,
                        seatNum: freeSeatCodes[0],
                        addGlasses: 0,
                        kbnEisyahousiki: '00',
                        mvtkNum: '',
                        mvtkKbnDenshiken: '00',
                        mvtkKbnMaeuriken: '00',
                        mvtkKbnKensyu: '00',
                        mvtkSalesPrice: 0
                    }
                }
            ]
        });
        debug('seatReservationAuthorization is', seatReservationAuthorization);
        // COAオーソリ削除
        // debug('removing authorizations coaSeatReservation...');
        // response = await request.del({
        //     url: `${API_ENDPOINT}/transactions/${transactionId}/authorizations/${coaAuthorizationId}`,
        //     auth: { bearer: accessToken },
        //     body: {
        //     },
        //     json: true,
        //     simple: false,
        //     resolveWithFullResponse: true
        // });
        // debug('removeCOASeatReservationAuthorization result:', response.statusCode, response.body);
        // if (response.statusCode !== httpStatus.NO_CONTENT) {
        //     throw new Error(response.body.message);
        // }
        // GMOオーソリ取得
        const orderId = util.format('%s%s%s%s', moment().format('YYYYMMDD'), theaterCode, 
        // tslint:disable-next-line:no-magic-numbers
        `00000000${seatReservationAuthorization.result.tmpReserveNum}`.slice(-8), '01');
        debug('adding authorizations gmo...');
        const gmoAuthorization = yield sskts.transaction.placeOrder.authorizeGMOCard({
            auth: auth,
            transactionId: transaction.id,
            orderId: orderId,
            amount: totalPrice,
            creditCard: {
                method: '1',
                cardNo: '4111111111111111',
                expire: '2012',
                securityCode: '123'
            }
        });
        debug('gmoAuthorization is', gmoAuthorization);
        // GMOオーソリ削除
        // debug('removing authorizations gmo...');
        // response = await request.del({
        //     url: `${API_ENDPOINT}/transactions/${transactionId}/authorizations/${gmoAuthorizationId}`,
        //     auth: { bearer: accessToken },
        //     body: {
        //     },
        //     json: true,
        //     simple: false,
        //     resolveWithFullResponse: true
        // });
        // debug('removeGMOAuthorization result:', response.statusCode, response.body);
        // if (response.statusCode !== httpStatus.NO_CONTENT) {
        //     throw new Error(response.body.message);
        // }
        // COA仮予約2回目
        // debug('adding authorizations coaSeatReservation...');
        // response = await request.post({
        //     url: `${API_ENDPOINT}/transactions/${transactionId}/authorizations/coaSeatReservation`,
        //     auth: { bearer: accessToken },
        //     body: {
        //         owner_from: promoterOwnerId,
        //         owner_to: anonymousOwnerId,
        //         coa_tmpReserveNum: reserveSeatsTemporarilyResult2.tmpReserveNum,
        //         coa_theater_code: theaterCode,
        //         coa_date_jouei: dateJouei,
        //         coa_title_code: titleCode,
        //         coa_title_branch_num: titleBranchNum,
        //         coa_time_begin: timeBegin,
        //         coa_screen_code: screenCode,
        //         seats: reserveSeatsTemporarilyResult2.listTmpReserve.map((tmpReserve) => {
        //             return {
        //                 individualScreeningEvent: individualScreeningEvent.id,
        //                 screen_section: tmpReserve.seatSection,
        //                 seat_code: tmpReserve.seatNum,
        //                 ticket_code: salesTicketResult[0].ticketCode,
        //                 ticket_name: {
        //                     ja: salesTicketResult[0].ticketName,
        //                     en: salesTicketResult[0].ticketNameEng
        //                 },
        //                 ticket_name_kana: salesTicketResult[0].ticketNameKana,
        //                 std_price: salesTicketResult[0].stdPrice,
        //                 add_price: salesTicketResult[0].addPrice,
        //                 dis_price: 0,
        //                 sale_price: salesTicketResult[0].salePrice,
        //                 mvtk_app_price: 0,
        //                 add_glasses: 0,
        //                 kbn_eisyahousiki: '00',
        //                 mvtk_num: '',
        //                 mvtk_kbn_denshiken: '00',
        //                 mvtk_kbn_maeuriken: '00',
        //                 mvtk_kbn_kensyu: '00',
        //                 mvtk_sales_price: 0
        //             };
        //         }),
        //         price: totalPrice
        //     },
        //     json: true,
        //     simple: false,
        //     resolveWithFullResponse: true
        // });
        // debug('addCOASeatReservationAuthorization result:', response.statusCode, response.body);
        // if (response.statusCode !== httpStatus.OK) {
        //     throw new Error(response.body.message);
        // }
        // GMOオーソリ取得(2回目)
        // orderId = Date.now().toString();
        // debug('adding authorizations gmo...');
        // response = await request.post({
        //     url: `${API_ENDPOINT}/transactions/${transactionId}/authorizations/gmo`,
        //     auth: { bearer: accessToken },
        //     body: {
        //         owner_from: anonymousOwnerId,
        //         owner_to: promoterOwnerId,
        //         gmo_shop_id: gmoShopId,
        //         gmo_shop_pass: gmoShopPass,
        //         gmo_order_id: orderId,
        //         gmo_amount: totalPrice,
        //         gmo_access_id: entryTranResult2.accessId,
        //         gmo_access_pass: entryTranResult2.accessPass,
        //         gmo_job_cd: sskts.GMO.Util.JOB_CD_AUTH,
        //         gmo_pay_type: sskts.GMO.Util.PAY_TYPE_CREDIT
        //     },
        //     json: true,
        //     resolveWithFullResponse: true
        // });
        // debug('addGMOAuthorization result:', response.statusCode, response.body);
        // if (response.statusCode !== httpStatus.OK) {
        //     throw new Error(response.body.message);
        // }
        // 購入者情報登録
        debug('setting agent profile...');
        const profile = {
            givenName: 'てつ',
            familyName: 'やまざき',
            telephone: '09012345678',
            email: process.env.SSKTS_DEVELOPER_EMAIL
        };
        yield sskts.transaction.placeOrder.setAgentProfile({
            auth: auth,
            transactionId: transaction.id,
            profile: profile
        });
        // メール追加
        //     const content = `
        // sskts-api:samples 様\n
        // -------------------------------------------------------------------\n
        // この度はご購入いただき誠にありがとうございます。\n
        // -------------------------------------------------------------------\n
        // ◆購入番号 ：${seatReservationAuthorization.result.tmpReserveNum}\n
        // ◆電話番号 ${profile.telephone}\n
        // ◆合計金額 ：${totalPrice}円\n
        // -------------------------------------------------------------------\n
        // `;
        // debug('adding email...');
        // response = await request.post({
        //     url: `${API_ENDPOINT}/transactions/${transactionId}/notifications/email`,
        //     auth: { bearer: accessToken },
        //     body: {
        //         from: 'noreply@example.com',
        //         to: process.env.SSKTS_DEVELOPER_EMAIL,
        //         subject: '購入完了',
        //         content: content
        //     },
        //     json: true,
        //     simple: false,
        //     resolveWithFullResponse: true
        // });
        // debug('addEmail result:', response.statusCode, response.body);
        // if (response.statusCode !== httpStatus.OK) {
        //     throw new Error(response.body.message);
        // }
        // const notificationId = response.body.data.id;
        // メール削除
        // debug('removing email...');
        // response = await request.del({
        //     url: `${API_ENDPOINT}/transactions/${transactionId}/notifications/${notificationId}`,
        //     auth: { bearer: accessToken },
        //     body: {
        //     },
        //     json: true,
        //     simple: false,
        //     resolveWithFullResponse: true
        // });
        // debug('removeEmail result:', response.statusCode, response.body);
        // if (response.statusCode !== httpStatus.NO_CONTENT) {
        //     throw new Error(response.body.message);
        // }
        // 取引成立
        debug('confirming transaction...');
        const order = yield sskts.transaction.placeOrder.confirm({
            auth: auth,
            transactionId: transaction.id
        });
        debug('your order is', order);
        // 照会してみる
        // response = await request.post({
        //     url: `${API_ENDPOINT}/transactions/makeInquiry`,
        //     auth: { bearer: accessToken },
        //     body: {
        //         inquiry_theater: theaterCode,
        //         inquiry_id: reserveSeatsTemporarilyResult2.tmpReserveNum,
        //         inquiry_pass: tel
        //     },
        //     json: true,
        //     simple: false,
        //     resolveWithFullResponse: true
        // });
        // debug('makeInquiry result:', response.statusCode, response.body);
    });
}
main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
