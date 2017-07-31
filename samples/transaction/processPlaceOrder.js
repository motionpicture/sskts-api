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
        const auth = new sskts.auth.OAuth2('motionpicture', 'motionpicture', 'teststate', [
            'transactions',
            'events.read-only',
            'organizations.read-only'
        ]);
        // 上映イベント検索
        const individualScreeningEvents = yield sskts.service.event.searchIndividualScreeningEvent({
            auth: auth,
            searchConditions: {
                theater: '118',
                day: moment().add(1, 'day').format('YYYYMMDD')
            }
        });
        // イベント情報取得
        const individualScreeningEvent = yield sskts.service.event.findIndividualScreeningEvent({
            auth: auth,
            identifier: individualScreeningEvents[0].identifier
        });
        // 劇場ショップ検索
        const movieTheaters = yield sskts.service.organization.searchMovieTheaters({
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
        debug('seller is', seller);
        if (seller === undefined) {
            throw new Error('劇場ショップはまだオープンしていません');
        }
        // 取引開始
        // 1分後のunix timestampを送信する場合
        // https://ja.wikipedia.org/wiki/UNIX%E6%99%82%E9%96%93
        debug('注文取引を開始します...');
        const transaction = yield sskts.service.transaction.placeOrder.start({
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
        debug('販売可能チケットは', salesTicketResult);
        // COA空席確認
        const getStateReserveSeatResult = yield sskts_domain_1.COA.services.reserve.stateReserveSeat({
            theaterCode: theaterCode,
            dateJouei: dateJouei,
            titleCode: titleCode,
            titleBranchNum: titleBranchNum,
            timeBegin: timeBegin,
            screenCode: screenCode
        });
        debug('空席情報は', getStateReserveSeatResult);
        const sectionCode = getStateReserveSeatResult.listSeat[0].seatSection;
        const freeSeatCodes = getStateReserveSeatResult.listSeat[0].listFreeSeat.map((freeSeat) => {
            return freeSeat.seatNum;
        });
        if (getStateReserveSeatResult.cntReserveFree === 0) {
            throw new Error('空席がありません');
        }
        // 座席仮予約
        debug('座席を仮予約します...');
        let seatReservationAuthorization = yield sskts.service.transaction.placeOrder.createSeatReservationAuthorization({
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
        debug('座席を仮予約しました', seatReservationAuthorization);
        // 座席仮予約取消
        debug('座席仮予約を取り消します...');
        yield sskts.service.transaction.placeOrder.cancelSeatReservationAuthorization({
            auth: auth,
            transactionId: transaction.id,
            authorizationId: seatReservationAuthorization.id
        });
        // 再度座席仮予約
        debug('座席を仮予約します...');
        seatReservationAuthorization = yield sskts.service.transaction.placeOrder.createSeatReservationAuthorization({
            auth: auth,
            transactionId: transaction.id,
            eventIdentifier: individualScreeningEvent.identifier,
            offers: [
                {
                    seatSection: sectionCode,
                    seatNumber: freeSeatCodes[0],
                    ticket: {
                        ticketCode: salesTicketResult[1].ticketCode,
                        stdPrice: salesTicketResult[1].stdPrice,
                        addPrice: salesTicketResult[1].addPrice,
                        disPrice: 0,
                        salePrice: salesTicketResult[1].salePrice,
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
        debug('座席を仮予約しました', seatReservationAuthorization);
        const amount = seatReservationAuthorization.price;
        // クレジットカードオーソリ取得
        let orderId = util.format('%s%s%s%s', moment().format('YYYYMMDD'), theaterCode, 
        // tslint:disable-next-line:no-magic-numbers
        `00000000${seatReservationAuthorization.result.tmpReserveNum}`.slice(-8), '01');
        debug('クレジットカードのオーソリをとります...');
        let creditCardAuthorization = yield sskts.service.transaction.placeOrder.createCreditCardAuthorization({
            auth: auth,
            transactionId: transaction.id,
            orderId: orderId,
            amount: amount,
            method: '1',
            creditCard: {
                cardNo: '4111111111111111',
                expire: '2012',
                securityCode: '123'
            }
        });
        debug('クレジットカードのオーソリがとれました', creditCardAuthorization);
        // クレジットカードオーソリ取消
        debug('クレジットカードのオーソリを取り消します...');
        yield sskts.service.transaction.placeOrder.cancelCreditCardAuthorization({
            auth: auth,
            transactionId: transaction.id,
            authorizationId: creditCardAuthorization.id
        });
        // 再度クレジットカードオーソリ
        orderId = util.format('%s%s%s%s', moment().format('YYYYMMDD'), theaterCode, 
        // tslint:disable-next-line:no-magic-numbers
        `00000000${seatReservationAuthorization.result.tmpReserveNum}`.slice(-8), '02');
        debug('クレジットカードのオーソリをとります...');
        creditCardAuthorization = yield sskts.service.transaction.placeOrder.createCreditCardAuthorization({
            auth: auth,
            transactionId: transaction.id,
            orderId: orderId,
            amount: amount,
            method: '1',
            creditCard: {
                cardNo: '4111111111111111',
                expire: '2012',
                securityCode: '123'
            }
        });
        debug('クレジットカードのオーソリがとれました', creditCardAuthorization);
        // 購入者情報登録
        debug('購入者情報を登録します...');
        const profile = {
            givenName: 'てつ',
            familyName: 'やまざき',
            telephone: '09012345678',
            email: process.env.SSKTS_DEVELOPER_EMAIL
        };
        yield sskts.service.transaction.placeOrder.setAgentProfile({
            auth: auth,
            transactionId: transaction.id,
            profile: profile
        });
        debug('購入者情報を登録しました');
        // 取引確定
        debug('注文取引を確定します...');
        const order = yield sskts.service.transaction.placeOrder.confirm({
            auth: auth,
            transactionId: transaction.id
        });
        debug('注文が作成されました', order);
        // メール追加
        const content = `
${order.customer.name} 様
-------------------------------------------------------------------
この度はご購入いただき誠にありがとうございます。
-------------------------------------------------------------------
◆購入番号 ：${order.orderInquiryKey.orderNumber}
◆電話番号 ${order.orderInquiryKey.telephone}
◆合計金額 ：${order.price}円
-------------------------------------------------------------------
`;
        debug('メール通知を実行します...', content);
        yield sskts.service.transaction.placeOrder.sendEmailNotification({
            auth: auth,
            transactionId: transaction.id,
            emailNotification: {
                from: 'noreply@example.com',
                to: profile.email,
                subject: '購入完了',
                content: content
            }
        });
        debug('メール通知が実行されました');
    });
}
main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
