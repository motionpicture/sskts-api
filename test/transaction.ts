// tslint:disable:no-http-string no-magic-numbers

/**
 * 取引フローテストスクリプト
 *
 * @ignore
 */
import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as request from 'request-promise-native';

const debug = createDebug('*');

// tslint:disable-next-line:max-func-body-length
async function main() {
    let response: any;
    const gmoShopId = 'tshop00026096';
    const gmoShopPass = 'xbxmkaa6';

    // 取引開始
    // 30分後のunix timestampを送信する場合
    // https://ja.wikipedia.org/wiki/UNIX%E6%99%82%E9%96%93
    debug('starting transaction...');
    response = await request.post({
        url: 'http://localhost:8080/transactions',
        body: {
            expired_at: moment().add(30, 'minutes').unix()
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    debug('/transactions/start result:', response.statusCode, response.body);
    if (response.statusCode !== 201) {
        throw new Error(response.body.message);
    }
    const transactionId = response.body.data.id;

    interface IOwner {
        id: string;
        group: string;
    }
    const owners: IOwner[] = response.body.data.attributes.owners;
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
    const salesTicketResult = await COA.ReserveService.salesTicket({
        theater_code: theaterCode,
        date_jouei: dateJouei,
        title_code: titleCode,
        title_branch_num: titleBranchNum,
        time_begin: timeBegin
    });

    // COA空席確認
    const getStateReserveSeatResult = await COA.ReserveService.getStateReserveSeat({
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
    const reserveSeatsTemporarilyResult = await COA.ReserveService.reserveSeatsTemporarily({
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
    response = await request.post({
        url: `http://localhost:8080/transactions/${transactionId}/authorizations/coaSeatReservation`,
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
    if (response.statusCode !== 200) {
        throw new Error(response.body.message);
    }
    const coaAuthorizationId = response.body.data.id;

    // COA仮予約削除
    await COA.ReserveService.deleteTmpReserve({
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
    response = await request.del({
        url: `http://localhost:8080/transactions/${transactionId}/authorizations/${coaAuthorizationId}`,
        body: {
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    debug('removeCOASeatReservationAuthorization result:', response.statusCode, response.body);
    if (response.statusCode !== 204) {
        throw new Error(response.body.message);
    }

    // GMOオーソリ取得
    let orderId = Date.now().toString();
    const entryTranResult = await GMO.CreditService.entryTran({
        shopId: gmoShopId,
        shopPass: gmoShopPass,
        orderId: orderId,
        jobCd: GMO.Util.JOB_CD_AUTH,
        amount: totalPrice
    });

    const execTranResult = await GMO.CreditService.execTran({
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
    response = await request.post({
        url: `http://localhost:8080/transactions/${transactionId}/authorizations/gmo`,
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
    if (response.statusCode !== 200) {
        throw new Error(response.body.message);
    }
    const gmoAuthorizationId = response.body.data.id;

    // GMOオーソリ取消
    const alterTranResult = await GMO.CreditService.alterTran({
        shopId: gmoShopId,
        shopPass: gmoShopPass,
        accessId: entryTranResult.accessId,
        accessPass: entryTranResult.accessPass,
        jobCd: GMO.Util.JOB_CD_VOID
    });
    debug('alterTranResult:', alterTranResult);

    // GMOオーソリ削除
    debug('removing authorizations gmo...');
    response = await request.del({
        url: `http://localhost:8080/transactions/${transactionId}/authorizations/${gmoAuthorizationId}`,
        body: {
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    debug('removeGMOAuthorization result:', response.statusCode, response.body);
    if (response.statusCode !== 204) {
        throw new Error(response.body.message);
    }

    // COA仮予約2回目
    const reserveSeatsTemporarilyResult2 = await COA.ReserveService.reserveSeatsTemporarily({
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
    response = await request.post({
        url: `http://localhost:8080/transactions/${transactionId}/authorizations/coaSeatReservation`,
        body: {
            owner_id_from: promoterOwnerId,
            owner_id_to: anonymousOwnerId,
            coa_tmp_reserve_num: reserveSeatsTemporarilyResult2.tmp_reserve_num,
            coa_theater_code: theaterCode,
            coa_date_jouei: dateJouei,
            coa_title_code: titleCode,
            coa_title_branch_num: titleBranchNum,
            coa_time_begin: timeBegin,
            coa_screen_code: screenCode,
            seats: reserveSeatsTemporarilyResult2.list_tmp_reserve.map((tmpReserve) => {
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
    if (response.statusCode !== 200) {
        throw new Error(response.body.message);
    }

    // GMOオーソリ取得(2回目)
    orderId = Date.now().toString();
    const entryTranResult2 = await GMO.CreditService.entryTran({
        shopId: gmoShopId,
        shopPass: gmoShopPass,
        orderId: orderId,
        jobCd: GMO.Util.JOB_CD_AUTH,
        amount: totalPrice
    });

    const execTranResult2 = await GMO.CreditService.execTran({
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
    response = await request.post({
        url: `http://localhost:8080/transactions/${transactionId}/authorizations/gmo`,
        body: {
            owner_id_from: anonymousOwnerId,
            owner_id_to: promoterOwnerId,
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
    if (response.statusCode !== 200) {
        throw new Error(response.body.message);
    }

    // 購入者情報登録
    debug('updating anonymous...');
    response = await request.patch({
        url: `http://localhost:8080/transactions/${transactionId}/anonymousOwner`,
        body: {
            name_first: 'Tetsu',
            name_last: 'Yamazaki',
            tel: '09012345678',
            email: 'hello@motionpicture.jp'
        },
        json: true,
        resolveWithFullResponse: true
    });
    debug('anonymousOwner updated.', response.statusCode, response.body);
    if (response.statusCode !== 204) {
        throw new Error(response.body.message);
    }

    // COA本予約
    const tel = '09012345678';
    const updateReserveResult = await COA.ReserveService.updateReserve({
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
                seat_num: tmpReserve.seat_num
            };
        })
    });
    debug('updateReserveResult:', updateReserveResult);

    // 照会情報登録(購入番号と電話番号で照会する場合)
    debug('enabling inquiry...');
    response = await request.patch({
        url: `http://localhost:8080/transactions/${transactionId}/enableInquiry`,
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
    if (response.statusCode !== 204) {
        throw new Error(response.body.message);
    }

    // メール追加
    const content = `
<!DOCTYPE html>
<html lang='ja'>
<head>
<meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
<title>購入完了</title>
</head>
<body>
<h1>この度はご購入いただき誠にありがとうございます。</h1>
<h3>購入番号 (Transaction number) :</h3>
<strong>${updateReserveResult.reserve_num}</strong>
</body>
</html>
`;
    debug('adding email...');
    response = await request.post({
        url: `http://localhost:8080/transactions/${transactionId}/notifications/email`,
        body: {
            from: 'noreply@localhost',
            to: 'hello@motionpicture.jp',
            subject: '購入完了',
            content: content
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    debug('addEmail result:', response.statusCode, response.body);
    if (response.statusCode !== 200) {
        throw new Error(response.body.message);
    }
    const notificationId = response.body.data.id;

    // メール削除
    debug('removing email...');
    response = await request.del({
        url: `http://localhost:8080/transactions/${transactionId}/notifications/${notificationId}`,
        body: {
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    debug('removeEmail result:', response.statusCode, response.body);
    if (response.statusCode !== 204) {
        throw new Error(response.body.message);
    }

    // 再度メール追加
    debug('adding email...');
    response = await request.post({
        url: `http://localhost:8080/transactions/${transactionId}/notifications/email`,
        body: {
            from: 'noreply@localhost',
            to: 'hello@motionpicture.jp',
            subject: '購入完了',
            content: content
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    debug('addEmail result:', response.statusCode, response.body);
    if (response.statusCode !== 200) {
        throw new Error(response.body.message);
    }

    // 取引成立
    debug('closing transaction...');
    response = await request.patch({
        url: `http://localhost:8080/transactions/${transactionId}/close`,
        body: {
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    debug('close result:', response.statusCode, response.body);
    if (response.statusCode !== 204) {
        throw new Error(response.body.message);
    }

    // 照会してみる
    response = await request.post({
        url: 'http://localhost:8080/transactions/makeInquiry',
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
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
