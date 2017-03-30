/**
 * ムビチケを使って購入する取引フローテストスクリプト
 *
 * @ignore
 */
import * as COA from '@motionpicture/coa-service';
import * as createDebug from 'debug';
import * as httpStatus from 'http-status';
import * as moment from 'moment';
import * as request from 'request-promise-native';

const debug = createDebug('sskts-api:examples:transactionWithMvtk');
const API_ENDPOINT = 'http://localhost:8081'; // tslint:disable-line:no-http-string

// tslint:disable-next-line:max-func-body-length cyclomatic-complexity
async function main() {
    let response: any;
    const performanceId = '11820170331170190502020'; // パフォーマンスID 空席なくなったら変更する

    // アクセストークン取得
    response = await request.post({
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
    response = await request.get({
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
    response = await request.get({
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
    response = await request.get({
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
    response = await request.post({
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

    // 販売可能チケット検索
    const salesTicketResult = await COA.ReserveService.salesTicket({
        theater_code: theaterCode,
        date_jouei: dateJouei,
        title_code: titleCode,
        title_branch_num: titleBranchNum,
        time_begin: timeBegin
    });

    // COA空席確認
    const getStateReserveSeatResult = await COA.ReserveService.stateReserveSeat({
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
    const reserveSeatsTemporarilyResult = await COA.ReserveService.updTmpReserveSeat({
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
    // const coaAuthorizationId = response.body.data.id;

    // 購入者情報登録
    debug('updating anonymous...');
    response = await request.patch({
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
    const updateReserveResult = await COA.ReserveService.updReserve({
        theater_code: theaterCode,
        date_jouei: dateJouei,
        title_code: titleCode,
        title_branch_num: titleBranchNum,
        time_begin: timeBegin,
        // screen_code: screenCode,
        tmp_reserve_num: reserveSeatsTemporarilyResult.tmp_reserve_num,
        reserve_name: '山崎 哲',
        reserve_name_jkana: 'ヤマザキ テツ',
        tel_num: '09012345678',
        mail_addr: 'yamazaki@motionpicture.jp',
        reserve_amount: totalPrice,
        list_ticket: reserveSeatsTemporarilyResult.list_tmp_reserve.map((tmpReserve) => {
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

    // 本当はここでムビチケ着券処理

    // ムビチケオーソリ追加(着券した体で) 値はほぼ適当です
    debug('adding authorizations mvtk...');
    response = await request.post({
        url: `${API_ENDPOINT}/transactions/${transactionId}/authorizations/mvtk`,
        auth: { bearer: accessToken },
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
            zsk_info: reserveSeatsTemporarilyResult.list_tmp_reserve.map((tmpReserve) => {
                return { zsk_cd: tmpReserve.seat_num }
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
    response = await request.patch({
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
    response = await request.post({
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
    // const notificationId = response.body.data.id;

    // 取引成立
    debug('closing transaction...');
    response = await request.patch({
        url: `${API_ENDPOINT}/transactions/${transactionId}/close`,
        auth: { bearer: accessToken },
        body: {
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    debug('close result:', response.statusCode, response.body);
    if (response.statusCode !== httpStatus.NO_CONTENT) {
        throw new Error(response.body.message);
    }

    // 照会してみる
    response = await request.post({
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
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
