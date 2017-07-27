"use strict";
/**
 * 劇場検索サンプル
 *
 * @ignore
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
const httpStatus = require("http-status");
const request = require("request-promise-native");
const Scenarios = require("./scenarios");
const debug = createDebug('sskts-api:examples');
const API_ENDPOINT = process.env.TEST_API_ENDPOINT;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const accessToken = yield Scenarios.getAccessToken();
        // 劇場検索
        yield request.get({
            url: `${API_ENDPOINT}/places/movieTheater`,
            qs: {},
            auth: { bearer: accessToken },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        }).then((response) => {
            debug('theater searched', response.statusCode, response.body);
            if (response.statusCode !== httpStatus.OK) {
                throw new Error(response.body.message);
            }
            debug('movieTheaters:', response.body.data);
        });
    });
}
main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
