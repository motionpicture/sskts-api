/**
 * 成功するまでGMOオーソリをたてにいくシナリオ
 *
 * @namespace loadtest/scenarios/repeatGMOAuthUntilSuccess
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';

import wait from './wait';

const debug = createDebug('sskts-api:loadtest:scenarios:repeatGMOAuthUntilSuccess');

const TEST_CARD_NO = '4111111111111111';
const TEST_EXPIRE = '2012';
const TEST_SECURITY_CODE = '123';
const RETRY_INTERVAL_IN_MILLISECONDS = 5000;
// const MAX_NUMBER_OF_RETRY = 10;

export interface IConfig {
    gmoShopId: string;
    gmoShopPass: string;
    amount: number;
    orderIdPrefix: string;
}

export interface IGMOAuthResult {
    countTry: number;
    orderId: string;
    accessId: string;
    accessPass: string;
}

export default async (config: IConfig): Promise<IGMOAuthResult> => {
    let result: IGMOAuthResult | null = null;
    let countTry: number = 0;

    while (result === null) {
        try {
            countTry += 1;

            // if (countTry > MAX_NUMBER_OF_RETRY) {
            //     throw new Error('GMO auth try limit exceeded');
            // }

            if (countTry > 1) {
                // {RETRY_INTERVAL_IN_MILLISECONDS}後にリトライ
                await wait(RETRY_INTERVAL_IN_MILLISECONDS);
            }

            debug('trying gmo auth...', countTry);
            // GMOオーソリ取得
            // tslint:disable-next-line:no-magic-numbers
            const orderId = `${config.orderIdPrefix}${`00${countTry}`.slice(-2)}`;
            const entryTranResult = await sskts.GMO.services.credit.entryTran({
                shopId: config.gmoShopId,
                shopPass: config.gmoShopPass,
                orderId: orderId,
                jobCd: sskts.GMO.utils.util.JOB_CD_AUTH,
                amount: config.amount
            });

            const execTranResult = await sskts.GMO.services.credit.execTran({
                accessId: entryTranResult.accessId,
                accessPass: entryTranResult.accessPass,
                orderId: orderId,
                method: '1',
                cardNo: TEST_CARD_NO,
                expire: TEST_EXPIRE,
                securityCode: TEST_SECURITY_CODE
            });
            debug(execTranResult);

            result = {
                countTry: countTry,
                orderId: orderId,
                accessId: entryTranResult.accessId,
                accessPass: entryTranResult.accessPass
            };
        } catch (error) {
            debug(error);
        }
    }

    return result;
};
