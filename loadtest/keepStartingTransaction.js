"use strict";
/**
 * 取引開始をたたき続けるスクリプト
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
const createDebug = require("debug");
const moment = require("moment");
const request = require("request-promise-native");
const debug = createDebug('sskts-api:loadtest:keepStartingTransaction');
let count = 0;
const MAX_NUBMER_OF_PARALLEL_TASKS = 200;
const INTERVAL_MILLISECONDS = 100;
const API_ENDPOINT = process.env.TEST_API_ENDPOINT;
const timer = setInterval(() => __awaiter(this, void 0, void 0, function* () {
    if (count >= MAX_NUBMER_OF_PARALLEL_TASKS) {
        clearTimeout(timer);
        return;
    }
    count += 1;
    const countNow = count;
    try {
        // アクセストークン取得
        const accessToken = yield request.post({
            url: `${API_ENDPOINT}/oauth/token`,
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
        // 取引開始
        const transaction = yield request.post({
            url: `${API_ENDPOINT}/transactions/startIfPossible`,
            auth: { bearer: accessToken },
            body: {
                // tslint:disable-next-line:no-magic-numbers
                expires_at: moment().add(30, 'minutes').unix()
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        }).then((response) => {
            return response.body.data;
        });
        debug('transaction:', (transaction !== null) ? transaction.id : null);
        debug('end', countNow);
    }
    catch (error) {
        console.error(error.message, countNow);
    }
}), INTERVAL_MILLISECONDS);
