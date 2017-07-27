"use strict";
/**
 * APIシナリオ
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
// import * as httpStatus from 'http-status';
const request = require("request-promise-native");
const debug = createDebug('sskts-api:examples');
const API_ENDPOINT = process.env.TEST_API_ENDPOINT;
function getAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        debug('requesting access token...');
        return yield request.post({
            url: `${API_ENDPOINT}/oauth/token`,
            body: {
                assertion: process.env.SSKTS_API_REFRESH_TOKEN,
                scope: 'admin'
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        }).then((response) => response.body.access_token);
    });
}
exports.getAccessToken = getAccessToken;
