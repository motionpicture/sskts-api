/**
 * すでに存在している座席予約を使った取引フローテストスクリプト
 * 運用ではありえない状況
 * シナリオテストに使うためのものです
 *
 * @ignore
 */
import * as GMO from '@motionpicture/gmo-service';
import * as createDebug from 'debug';
import * as httpStatus from 'http-status';
import * as moment from 'moment';
import * as request from 'request-promise-native';

const debug = createDebug('sskts-api:examples:transactionByExistingReserve');
const API_ENDPOINT = 'http://localhost:8081'; // tslint:disable-line:no-http-string

// tslint:disable-next-line:max-func-body-length
async function main() {
    let response: any;
    const gmoShopId = 'tshop00026096';
    const gmoShopPass = 'xbxmkaa6';
    const theaterCode = '118';
    const reserveNum = 1280;
    const tel = '09012345678';
    const totalPrice = 3600;

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

    // COAオーソリ追加
    debug('adding authorizations coaSeatReservation...');
    response = await request.post({
        url: `${API_ENDPOINT}/transactions/${transactionId}/authorizations/coaSeatReservation`,
        auth: { bearer: accessToken },
        body: {
            owner_from: '5868e16789cc75249cdbfa4b',
            owner_to: anonymousOwnerId,
            coa_tmp_reserve_num: reserveNum,
            coa_theater_code: theaterCode,
            coa_date_jouei: '20170408',
            coa_title_code: '16421',
            coa_title_branch_num: '0',
            coa_time_begin: '1010',
            coa_screen_code: '40',
            seats: [
                {
                    add_glasses: 0,
                    mvtk_app_price: 0,
                    sale_price: 1800,
                    dis_price: 0,
                    add_price: 0,
                    std_price: 1800,
                    ticket_name_kana: 'トウジツイッパン',
                    ticket_name_en: 'General Price',
                    ticket_name_ja: '当日一般',
                    ticket_code: '10',
                    seat_code: 'Ｂ－１',
                    section: '   ',
                    performance: '11820170408164210401010'
                },
                {
                    add_glasses: 0,
                    mvtk_app_price: 0,
                    sale_price: 1800,
                    dis_price: 0,
                    add_price: 0,
                    std_price: 1800,
                    ticket_name_kana: 'トウジツイッパン',
                    ticket_name_en: 'General Price',
                    ticket_name_ja: '当日一般',
                    ticket_code: '10',
                    seat_code: 'Ｂ－２',
                    section: '   ',
                    performance: '11820170408164210401010'
                }
            ],
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

    // GMOオーソリ取得
    const orderId = Date.now().toString();
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

    // 購入者情報登録
    debug('updating anonymous...');
    response = await request.patch({
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
    response = await request.patch({
        url: `${API_ENDPOINT}/transactions/${transactionId}/enableInquiry`,
        auth: { bearer: accessToken },
        body: {
            inquiry_theater: theaterCode,
            inquiry_id: reserveNum,
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
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
