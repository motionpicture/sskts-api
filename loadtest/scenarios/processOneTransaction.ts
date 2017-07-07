/**
 * ひとつの取引プロセスシナリオ
 *
 * @namespace loadtest/scenarios/processOneTransaction
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as httpStatus from 'http-status';
import * as moment from 'moment';
import * as request from 'request-promise-native';

const debug = createDebug('sskts-api:loadtest:scenarios:processOneTransaction');

export interface IConfig {
    apiEndpoint: string;
    theaterId: string;
    gmoShopId: string;
    gmoShopPass: string;
}

// tslint:disable-next-line:max-func-body-length
export default async (config: IConfig) => {
    // let response: any;

    // アクセストークン取得
    const accessToken = await request.post({
        url: `${config.apiEndpoint}/oauth/token`,
        body: {
            assertion: process.env.SSKTS_API_REFRESH_TOKEN,
            scope: 'admin'
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }).then((response) => {
        return response.body.access_token;
    });

    // パフォーマンス検索
    debug('searching performances...');
    const performances = await request.get({
        url: `${config.apiEndpoint}/performances`,
        auth: { bearer: accessToken },
        qs: {
            theater: config.theaterId,
            day: moment().add(1, 'day').format('YYYYMMDD')
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }).then((response) => {
        debug('performances searched', response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(`${response.body.errors[0].title} ${response.body.errors[0].detail}`);
        }

        return response.body.data;
    });

    // パフォーマンス取得
    debug('finding performance...');
    const performance = await request.get({
        url: `${config.apiEndpoint}/performances/${performances[0].id}`,
        auth: { bearer: accessToken },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }).then((response) => {
        debug('/performances/:id result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(`${response.body.errors[0].title} ${response.body.errors[0].detail}`);
        }

        return response.body.data.attributes;
    });

    // 作品取得
    debug('finding film...');
    const film = await request.get({
        url: `${config.apiEndpoint}/films/${performance.film.id}`,
        auth: { bearer: accessToken },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }).then((response) => {
        debug('/films/:id result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(`${response.body.errors[0].title} ${response.body.errors[0].detail}`);
        }

        return response.body.data.attributes;
    });

    // スクリーン取得
    debug('finding screen...');
    const screen = await request.get({
        url: `${config.apiEndpoint}/screens/${performance.screen.id}`,
        auth: { bearer: accessToken },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }).then((response) => {
        debug('/screens/:id result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(`${response.body.errors[0].title} ${response.body.errors[0].detail}`);
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
    debug('starting transaction...');
    const startTransactionResult = await request.post({
        url: `${config.apiEndpoint}/transactions/startIfPossible`,
        auth: { bearer: accessToken },
        body: {
            // tslint:disable-next-line:no-magic-numbers
            expires_at: moment().add(30, 'minutes').unix()
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }).then((response) => {
        debug('transaction start result:', response.statusCode, response.body);
        if (response.statusCode === httpStatus.NOT_FOUND) {
            throw new Error('please try later');
        }
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(`${response.body.errors[0].title} ${response.body.errors[0].detail}`);
        }

        return response.body.data;
    });

    const transactionId = startTransactionResult.id;

    interface IOwner {
        id: string;
        group: string;
    }
    const owners: IOwner[] = startTransactionResult.attributes.owners;
    const promoterOwner = owners.find((owner) => {
        return (owner.group === 'PROMOTER');
    });
    const promoterOwnerId = (promoterOwner) ? promoterOwner.id : null;
    const anonymousOwner = owners.find((owner) => {
        return (owner.group === 'ANONYMOUS');
    });
    const anonymousOwnerId = (anonymousOwner) ? anonymousOwner.id : null;

    // 販売可能チケット検索
    const salesTicketResult = await sskts.COA.ReserveService.salesTicket({
        theater_code: theaterCode,
        date_jouei: dateJouei,
        title_code: titleCode,
        title_branch_num: titleBranchNum,
        time_begin: timeBegin,
        flg_member: '0'
    });
    debug('salesTicketResult:', salesTicketResult);

    // COA空席確認
    const getStateReserveSeatResult = await sskts.COA.ReserveService.stateReserveSeat({
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

    const totalPrice = salesTicketResult[0].sale_price;

    // COA仮予約
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
    debug('reserveSeatsTemporarilyResult2:', reserveSeatsTemporarilyResult2);

    // COAオーソリ追加
    debug('adding authorizations coaSeatReservation...');
    const coaSeatAuthorization = {
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
    };
    await request.post({
        url: `${config.apiEndpoint}/transactions/${transactionId}/authorizations/coaSeatReservation`,
        auth: { bearer: accessToken },
        body: coaSeatAuthorization,
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }).then((response) => {
        debug('addCOASeatReservationAuthorization result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(`${response.body.errors[0].title} ${response.body.errors[0].detail}`);
        }
    });

    // COA予約番号の桁をそろえてGMOオーダーIDを生成
    // tslint:disable-next-line:no-magic-numbers
    const orderId = `${moment().format('YYYYMMDD')}${config.theaterId}${`00000000${coaSeatAuthorization.coa_tmp_reserve_num}`.slice(-8)}00`;
    // GMOオーソリ取得
    const entryTranResult2 = await sskts.GMO.services.credit.entryTran({
        shopId: config.gmoShopId,
        shopPass: config.gmoShopPass,
        orderId: orderId,
        jobCd: sskts.GMO.utils.util.JOB_CD_AUTH,
        amount: totalPrice
    });

    const execTranResult2 = await sskts.GMO.services.credit.execTran({
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
    await request.post({
        url: `${config.apiEndpoint}/transactions/${transactionId}/authorizations/gmo`,
        auth: { bearer: accessToken },
        body: {
            owner_from: anonymousOwnerId,
            owner_to: promoterOwnerId,
            gmo_shop_id: config.gmoShopId,
            gmo_shop_pass: config.gmoShopPass,
            gmo_order_id: orderId,
            gmo_amount: totalPrice,
            gmo_access_id: entryTranResult2.accessId,
            gmo_access_pass: entryTranResult2.accessPass,
            gmo_job_cd: sskts.GMO.utils.util.JOB_CD_AUTH,
            gmo_pay_type: sskts.GMO.utils.util.PAY_TYPE_CREDIT
        },
        json: true,
        resolveWithFullResponse: true
    }).then((response) => {
        debug('addGMOAuthorization result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(`${response.body.errors[0].title} ${response.body.errors[0].detail}`);
        }
    });

    // 購入者情報登録
    debug('updating anonymous...');
    const tel = '09012345678';
    await request.patch({
        url: `${config.apiEndpoint}/transactions/${transactionId}/anonymousOwner`,
        auth: { bearer: accessToken },
        body: {
            name_first: 'てつ',
            name_last: 'やまざき',
            tel: tel,
            email: process.env.SSKTS_DEVELOPER_EMAIL
        },
        json: true,
        resolveWithFullResponse: true
    }).then((response) => {
        debug('anonymousOwner updated.', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.NO_CONTENT) {
            throw new Error(`${response.body.errors[0].title} ${response.body.errors[0].detail}`);
        }
    });

    // 照会情報登録(購入番号と電話番号で照会する場合)
    debug('enabling inquiry...');
    await request.patch({
        url: `${config.apiEndpoint}/transactions/${transactionId}/enableInquiry`,
        auth: { bearer: accessToken },
        body: {
            inquiry_theater: theaterCode,
            inquiry_id: reserveSeatsTemporarilyResult2.tmp_reserve_num,
            inquiry_pass: tel
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }).then((response) => {
        debug('enableInquiry result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.NO_CONTENT) {
            throw new Error(`${response.body.errors[0].title} ${response.body.errors[0].detail}`);
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
◆電話番号 ：09012345678\n
◆合計金額 ：${totalPrice}円\n
\n
※このアドレスは送信専用です。返信はできませんのであらかじめご了承下さい。\n
-------------------------------------------------------------------\n
シネマサンシャイン\n
http://www.cinemasunshine.co.jp/\n
-------------------------------------------------------------------\n
`;
    // メール追加
    debug('adding email...');
    await request.post({
        url: `${config.apiEndpoint}/transactions/${transactionId}/notifications/email`,
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
    }).then((response) => {
        debug('addEmail result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(`${response.body.errors[0].title} ${response.body.errors[0].detail}`);
        }
    });

    // 取引成立
    debug('closing transaction...');
    await request.patch({
        url: `${config.apiEndpoint}/transactions/${transactionId}/close`,
        auth: { bearer: accessToken },
        body: {
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }).then((response) => {
        debug('close result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.NO_CONTENT) {
            throw new Error(`${response.body.errors[0].title} ${response.body.errors[0].detail}`);
        }
    });

    // 照会してみる
    const makeInrquiryResult = await request.post({
        url: `${config.apiEndpoint}/transactions/makeInquiry`,
        auth: { bearer: accessToken },
        body: {
            inquiry_theater: theaterCode,
            inquiry_id: reserveSeatsTemporarilyResult2.tmp_reserve_num,
            inquiry_pass: tel
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }).then((response) => {
        debug('makeInquiry result:', response.statusCode, response.body);

        return response.body.data;
    });

    return {
        coaSeatAuthorization,
        makeInrquiryResult
    };
};
