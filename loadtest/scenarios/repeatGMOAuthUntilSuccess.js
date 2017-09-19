"use strict";
/**
 * 成功するまでGMOオーソリをたてにいくシナリオ
 *
 * @namespace loadtest/scenarios/repeatGMOAuthUntilSuccess
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
const wait_1 = require("./wait");
const debug = createDebug('sskts-api:loadtest:scenarios:repeatGMOAuthUntilSuccess');
const TEST_CARD_NO = '4111111111111111';
const TEST_EXPIRE = '2012';
const TEST_SECURITY_CODE = '123';
const RETRY_INTERVAL_IN_MILLISECONDS = 5000;
exports.default = (config) => __awaiter(this, void 0, void 0, function* () {
    let result = null;
    let countTry = 0;
    while (result === null) {
        try {
            countTry += 1;
            // if (countTry > MAX_NUMBER_OF_RETRY) {
            //     throw new Error('GMO auth try limit exceeded');
            // }
            if (countTry > 1) {
                // {RETRY_INTERVAL_IN_MILLISECONDS}後にリトライ
                yield wait_1.default(RETRY_INTERVAL_IN_MILLISECONDS);
            }
            debug('trying gmo auth...', countTry);
            // GMOオーソリ取得
            // tslint:disable-next-line:no-magic-numbers
            const orderId = `${config.orderIdPrefix}${`00${countTry}`.slice(-2)}`;
            const entryTranResult = yield sskts.GMO.services.credit.entryTran({
                shopId: config.gmoShopId,
                shopPass: config.gmoShopPass,
                orderId: orderId,
                jobCd: sskts.GMO.utils.util.JobCd.Auth,
                amount: config.amount
            });
            const execTranResult = yield sskts.GMO.services.credit.execTran({
                accessId: entryTranResult.accessId,
                accessPass: entryTranResult.accessPass,
                orderId: orderId,
                method: sskts.GMO.utils.util.Method.Lump,
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
        }
        catch (error) {
            debug(error);
        }
    }
    return result;
});
