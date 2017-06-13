/**
 * すでに存在している座席予約を使った取引フローテストスクリプト
 * 運用ではありえない状況
 * シナリオテストに使うためのものです
 *
 * @ignore
 */

import * as GMO from '@motionpicture/gmo-service';
import * as httpStatus from 'http-status';
import * as moment from 'moment';
import * as request from 'request-promise-native';
import * as winston from 'winston';

import processOneTransaction from './scenarios/processOneTransaction';
import repeatGMOAuthUntilSuccess from './scenarios/repeatGMOAuthUntilSuccess';
import wait from './scenarios/wait';

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: false,
            level: 'debug',
            json: false,
            showLevel: false
        }),
        new (winston.transports.File)({
            filename: `logs/transactionByExistingReserve-${moment().format('YYYYMMDDHHmmss')}.log`,
            timestamp: false,
            level: 'info',
            json: false,
            showLevel: false
        })
    ]
});

const API_ENDPOINT = process.env.TEST_API_ENDPOINT;
const TEST_THEATER_ID = '118';
// const TEST_GMO_SHOP_ID = 'tshop00026096';
// const TEST_GMO_SHOP_PASS = 'xbxmkaa6';
const TEST_GMO_SHOP_ID = 'tshop00026715';
const TEST_GMO_SHOP_PASS = 'ybmbptww';

// tslint:disable-next-line:max-func-body-length
async function main(coaSeatAuthorization: any, makeInrquiryResult: any) {
    // アクセストークン取得
    const accessToken = await request.post({
        url: `${API_ENDPOINT}/oauth/token`,
        body: {
            assertion: process.env.SSKTS_API_REFRESH_TOKEN,
            scope: 'admin'
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }).then((response) => {
        logger.debug('oauth token result:', response.statusCode, response.body);

        return response.body.access_token;
    });

    const reserveNum = makeInrquiryResult.attributes.inquiry_key.reserve_num;
    const tel = '09012345678';
    const totalPrice = coaSeatAuthorization.price;

    // 取引開始
    logger.debug('starting transaction...');
    const startTransactionResult = await request.post({
        url: `${API_ENDPOINT}/transactions/startIfPossible`,
        auth: { bearer: accessToken },
        body: {
            expires_at: moment().add(15, 'minutes').unix() // tslint:disable-line:no-magic-numbers
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }).then((response) => {
        logger.debug('transaction start result:', response.statusCode, response.body);
        if (response.statusCode === httpStatus.NOT_FOUND) {
            throw new Error('please try later');
        }
        if (response.statusCode !== httpStatus.OK) {
            handleError(response.body);
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

    // tslint:disable-next-line:no-magic-numbers
    await wait(5000);

    // COAオーソリ追加
    logger.debug('adding authorizations coaSeatReservation...');
    const coaSeatAuthorizationNow = { ...coaSeatAuthorization, ...{ owner_to: anonymousOwnerId } };
    await request.post({
        url: `${API_ENDPOINT}/transactions/${transactionId}/authorizations/coaSeatReservation`,
        auth: { bearer: accessToken },
        body: coaSeatAuthorizationNow,
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }).then((response) => {
        logger.debug('addCOASeatReservationAuthorization result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            handleError(response.body);
        }
    });

    // tslint:disable-next-line:no-magic-numbers
    await wait(5000);

    // GMOオーソリ取得(できるまで続ける)
    const gmoAuthResult = await repeatGMOAuthUntilSuccess({
        gmoShopId: TEST_GMO_SHOP_ID,
        gmoShopPass: TEST_GMO_SHOP_PASS,
        amount: totalPrice,
        orderIdPrefix: `${moment().format('YYYYMMDD')}${TEST_THEATER_ID}${moment().format('HHmmssSS')}`
    });
    logger.debug('gmo auth countTry:', gmoAuthResult.countTry);

    // GMOオーソリ追加
    logger.debug('adding authorizations gmo...');
    await request.post({
        url: `${API_ENDPOINT}/transactions/${transactionId}/authorizations/gmo`,
        auth: { bearer: accessToken },
        body: {
            owner_from: anonymousOwnerId,
            owner_to: promoterOwnerId,
            gmo_shop_id: TEST_GMO_SHOP_ID,
            gmo_shop_pass: TEST_GMO_SHOP_PASS,
            gmo_order_id: gmoAuthResult.orderId,
            gmo_amount: totalPrice,
            gmo_access_id: gmoAuthResult.accessId,
            gmo_access_pass: gmoAuthResult.accessPass,
            gmo_job_cd: GMO.Util.JOB_CD_AUTH,
            gmo_pay_type: GMO.Util.PAY_TYPE_CREDIT
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }).then((response) => {
        logger.debug('addGMOAuthorization result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            handleError(response.body);
        }
    });

    // 購入者情報登録
    logger.debug('updating anonymous...');
    await request.patch({
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
    }).then((response) => {
        logger.debug('anonymousOwner updated.', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.NO_CONTENT) {
            handleError(response.body);
        }
    });

    // 照会情報登録(購入番号と電話番号で照会する場合)
    logger.debug('enabling inquiry...');
    await request.patch({
        url: `${API_ENDPOINT}/transactions/${transactionId}/enableInquiry`,
        auth: { bearer: accessToken },
        body: {
            inquiry_theater: TEST_THEATER_ID,
            inquiry_id: reserveNum,
            inquiry_pass: '00000000000' // 購入取消されないようにあえて間違った値
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }).then((response) => {
        logger.debug('enableInquiry result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.NO_CONTENT) {
            handleError(response.body);
        }
    });

    // メール追加
    const content = `
sskts-api:loadtest:transactionByExistingReserve 様\n
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
    logger.debug('adding email...');
    await request.post({
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
    }).then((response) => {
        logger.debug('addEmail result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            handleError(response.body);
        }
    });

    // tslint:disable-next-line:no-magic-numbers
    await wait(5000);

    // 取引成立
    logger.debug('closing transaction...');
    await request.patch({
        url: `${API_ENDPOINT}/transactions/${transactionId}/close`,
        auth: { bearer: accessToken },
        body: {
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }).then((response) => {
        logger.debug('close result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.NO_CONTENT) {
            handleError(response.body);
        }
    });

    return {
        gmoAuthResult
    };
}

/**
 * エラーレスポンスハンドリング
 *
 * @param {any} body レスポンスボディ
 */
function handleError(body: any) {
    if (body.errors !== undefined) {
        throw new Error(`${body.errors[0].title} ${body.errors[0].detail}`);
    } else {
        throw new Error(body.text);
    }
}

let count = 0;
let numberOfClosedTransactions = 0;
let numberOfProcessedTransactions = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 1800;
const INTERVAL_MILLISECONDS = 500;

export interface IResultTransaction {
    no: number;
    startedAt: Date;
    processedAt: Date | null;
    error: string;
    gmoOrderId: string;
    countTryGMOAuth: number;
}

const results: IResultTransaction[] = [];

// まず普通にひとつの取引プロセス
processOneTransaction({
    apiEndpoint: API_ENDPOINT,
    theaterId: TEST_THEATER_ID,
    gmoShopId: TEST_GMO_SHOP_ID,
    gmoShopPass: TEST_GMO_SHOP_PASS
}).then((processTransactionResult) => {
    logger.info('processTransaction success!', processTransactionResult);

    const fields = ['no', 'started', 'processed', 'gmoOrderId', 'countTryGMOAuth', 'error'];
    logger.info(`|${fields.join('|')}|\n|${Array.from(Array(fields.length)).map(() => ' :--- ').join('|')}|`);

    const timer = setInterval(
        async () => {
            if (count >= MAX_NUBMER_OF_PARALLEL_TASKS) {
                clearTimeout(timer);

                return;
            }

            count += 1;
            const countNow = count;
            const resultTransaction: IResultTransaction = {
                no: countNow,
                startedAt: new Date(),
                processedAt: null,
                error: '',
                gmoOrderId: '',
                countTryGMOAuth: 0
            };

            try {
                logger.debug('starting...', countNow);
                const mainResult = await main(processTransactionResult.coaSeatAuthorization, processTransactionResult.makeInrquiryResult);
                numberOfClosedTransactions += 1;

                resultTransaction.countTryGMOAuth = mainResult.gmoAuthResult.countTry;
                resultTransaction.gmoOrderId = mainResult.gmoAuthResult.orderId;
            } catch (error) {
                resultTransaction.error = error.message;
            }

            numberOfProcessedTransactions += 1;

            // 結果リストに追加
            resultTransaction.processedAt = new Date();
            results.push(resultTransaction);

            // 結果リストをログ
            logger.info(result2markdown(resultTransaction));
        },
        INTERVAL_MILLISECONDS
    );
}).catch((err) => {
    console.error(err);
    process.exit(1);
});

process.on('exit', () => {
    logger.info('numberOfClosedTransactions:', numberOfClosedTransactions);
    logger.info('results', [results]);
});

function result2markdown(resultTransaction: IResultTransaction) {
    let markdown = '';
    const resultStr = [
        resultTransaction.no.toString(),
        moment(resultTransaction.startedAt).format('YYYY-MM-DDTHH:mm:ss'),
        (resultTransaction.processedAt instanceof Date) ? moment(resultTransaction.processedAt).format('YYYY-MM-DDTHH:mm:ss') : '',
        resultTransaction.gmoOrderId,
        resultTransaction.countTryGMOAuth,
        resultTransaction.error
    ].join('|');
    markdown += `|${resultStr}|`;

    return markdown;
}
