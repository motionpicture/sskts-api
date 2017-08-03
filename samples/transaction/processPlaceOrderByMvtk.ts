/**
 * 注文取引プロセスサンプル
 *
 * @ignore
 */

import { COA } from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as moment from 'moment';

import * as sskts from '../lib/sskts-api';

const debug = createDebug('sskts-api:samples');

// tslint:disable-next-line:max-func-body-length
async function main() {
    const auth = new sskts.auth.ClientCredentials(
        'motionpicture',
        'motionpicture',
        'teststate',
        [
            'transactions',
            'events.read-only',
            'organizations.read-only'
        ]
    );
    const credentials = await auth.refreshAccessToken();
    debug('credentials:', credentials);

    // 上映イベント検索
    const individualScreeningEvents = await sskts.service.event.searchIndividualScreeningEvent({
        auth: auth,
        searchConditions: {
            theater: '118',
            day: moment().add(1, 'day').format('YYYYMMDD')
        }
    });

    // イベント情報取得
    const individualScreeningEvent = await sskts.service.event.findIndividualScreeningEvent({
        auth: auth,
        identifier: individualScreeningEvents[0].identifier
    });
    if (individualScreeningEvent === null) {
        throw new Error('指定された上映イベントが見つかりません');
    }

    // 劇場ショップ検索
    const movieTheaterOrganization = await sskts.service.organization.findMovieTheaterByBranchCode({
        auth: auth,
        branchCode: individualScreeningEvent.coaInfo.theaterCode
    });
    if (movieTheaterOrganization === null) {
        throw new Error('劇場ショップがオープンしていません');
    }

    const theaterCode = individualScreeningEvent.coaInfo.theaterCode;
    const dateJouei = individualScreeningEvent.coaInfo.dateJouei;
    const titleCode = individualScreeningEvent.coaInfo.titleCode;
    const titleBranchNum = individualScreeningEvent.coaInfo.titleBranchNum;
    const timeBegin = individualScreeningEvent.coaInfo.timeBegin;
    const screenCode = individualScreeningEvent.coaInfo.screenCode;

    // 取引開始
    // 1分後のunix timestampを送信する場合
    // https://ja.wikipedia.org/wiki/UNIX%E6%99%82%E9%96%93
    debug('starting transaction...');
    const transaction = await sskts.service.transaction.placeOrder.start({
        auth: auth,
        expires: moment().add(1, 'minutes').toDate(),
        sellerId: movieTheaterOrganization.id
    });

    // 販売可能チケット検索
    const salesTicketResult = await COA.services.reserve.salesTicket({
        theaterCode: theaterCode,
        dateJouei: dateJouei,
        titleCode: titleCode,
        titleBranchNum: titleBranchNum,
        timeBegin: timeBegin,
        flgMember: COA.services.reserve.FlgMember.NonMember
    });
    debug('salesTicketResult:', salesTicketResult);

    // COA空席確認
    const getStateReserveSeatResult = await COA.services.reserve.stateReserveSeat({
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

    const seatReservationAuthorization = await sskts.service.transaction.placeOrder.createSeatReservationAuthorization({
        auth: auth,
        transactionId: transaction.id,
        eventIdentifier: individualScreeningEvent.identifier,
        offers: [
            {
                seatSection: sectionCode,
                seatNumber: freeSeatCodes[0],
                ticket: {
                    ticketCode: salesTicketResult[0].ticketCode,
                    ticketName: salesTicketResult[0].ticketName,
                    ticketNameEng: salesTicketResult[0].ticketNameEng,
                    ticketNameKana: salesTicketResult[0].ticketNameKana,
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

    // 本当はここでムビチケ着券処理

    // ムビチケオーソリ追加(着券した体で) 値はほぼ適当です
    debug('adding authorizations mvtk...');
    let mvtkAuthorization = await sskts.service.transaction.placeOrder.createMvtkAuthorization({
        auth: auth,
        transactionId: transaction.id,
        mvtk: {
            price: totalPrice,
            kgygishCd: 'SSK000',
            yykDvcTyp: '00',
            trkshFlg: '0',
            kgygishSstmZskyykNo: '118124',
            kgygishUsrZskyykNo: '124',
            jeiDt: '2017/03/0210: 00: 00',
            kijYmd: '2017/03/02',
            stCd: '15',
            screnCd: '1',
            knyknrNoInfo: [
                {
                    knyknrNo: '4450899842',
                    pinCd: '7648',
                    knshInfo: [
                        { knshTyp: '01', miNum: '2' }
                    ]
                }
            ],
            zskInfo: seatReservationAuthorization.result.listTmpReserve.map((tmpReserve: any) => {
                return { zskCd: tmpReserve.seatNum };
            }),
            skhnCd: '1622700'
        }
    });
    debug('addMvtkAuthorization is', mvtkAuthorization);

    // ムビチケ取消
    await sskts.service.transaction.placeOrder.cancelMvtkAuthorization({
        auth: auth,
        transactionId: transaction.id,
        authorizationId: mvtkAuthorization.id
    });

    // 再度ムビチケ追加
    debug('adding authorizations mvtk...');
    mvtkAuthorization = await sskts.service.transaction.placeOrder.createMvtkAuthorization({
        auth: auth,
        transactionId: transaction.id,
        mvtk: {
            price: totalPrice,
            kgygishCd: 'SSK000',
            yykDvcTyp: '00',
            trkshFlg: '0',
            kgygishSstmZskyykNo: '118124',
            kgygishUsrZskyykNo: '124',
            jeiDt: '2017/03/0210: 00: 00',
            kijYmd: '2017/03/02',
            stCd: '15',
            screnCd: '1',
            knyknrNoInfo: [
                {
                    knyknrNo: '4450899842',
                    pinCd: '7648',
                    knshInfo: [
                        { knshTyp: '01', miNum: '2' }
                    ]
                }
            ],
            zskInfo: seatReservationAuthorization.result.listTmpReserve.map((tmpReserve: any) => {
                return { zskCd: tmpReserve.seatNum };
            }),
            skhnCd: '1622700'
        }
    });
    debug('addMvtkAuthorization is', mvtkAuthorization);

    // 購入者情報登録
    debug('setting agent profile...');
    const profile = {
        givenName: 'てつ',
        familyName: 'やまざき',
        telephone: '09012345678',
        email: <string>process.env.SSKTS_DEVELOPER_EMAIL
    };
    await sskts.service.transaction.placeOrder.setAgentProfile({
        auth: auth,
        transactionId: transaction.id,
        profile: profile
    });

    // 取引成立
    debug('confirming transaction...');
    const order = await sskts.service.transaction.placeOrder.confirm({
        auth: auth,
        transactionId: transaction.id
    });
    debug('your order is', order);
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
