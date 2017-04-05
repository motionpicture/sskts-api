"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 劇場テストの例
 *
 * @ignore
 */
const createDebug = require("debug");
const httpStatus = require("http-status");
const request = require("request-promise-native");
const debug = createDebug('sskts-api:examples:transaction');
const API_ENDPOINT = 'http://localhost:8081'; // tslint:disable-line:no-http-string
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let response;
        // アクセストークン取得
        response = yield request.post({
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
        debug('finding theater...');
        response = yield request.get({
            url: `${API_ENDPOINT}/theaters/118`,
            auth: { bearer: accessToken },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });
        debug('/theaters/:id result:', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(response.body.message);
        }
        const theater = response.body.data.attributes;
        debug(theater);
    });
}
main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
