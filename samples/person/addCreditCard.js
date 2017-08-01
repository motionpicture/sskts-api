"use strict";
/**
 * クレジットカード追加サンプル
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
const sskts = require("../lib/sskts-api");
const debug = createDebug('sskts-api:samples');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = new sskts.auth.OAuth2('motionpicture', '', 'teststate', ['people.creditCards']);
        // Googleから受け取ったid_tokenを使ってサインイン
        yield auth.signInWithGoogle(
        // tslint:disable-next-line:max-line-length
        'eyJhbGciOiJSUzI1NiIsImtpZCI6IjU2NjE5YWRiMjJkMWE1NDU2MjAzNmJmNTEwODBmZjZjZjdjZTNjZjIifQ.eyJhenAiOiI5MzI5MzQzMjQ2NzEtNjZrYXN1am50ajJqYTdjNWs0azU1aWo2cGFrcHFpcjQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5MzI5MzQzMjQ2NzEtNjZrYXN1am50ajJqYTdjNWs0azU1aWo2cGFrcHFpcjQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDgwMTczNzA5ODQ2NDQ2NDkyODgiLCJlbWFpbCI6Imlsb3ZlZ2FkZEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6ImFlRGE3b0xlTDg3dlZJOFY5SmdfTkEiLCJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiaWF0IjoxNTAxNTQ4NDQwLCJleHAiOjE1MDE1NTIwNDAsIm5hbWUiOiJUZXRzdSBZYW1hemFraSIsInBpY3R1cmUiOiJodHRwczovL2xoNi5nb29nbGV1c2VyY29udGVudC5jb20vLVRpM29LMmwxNmJzL0FBQUFBQUFBQUFJL0FBQUFBQUFBNjNNL01Dc0JlWWNpWnpJL3M5Ni1jL3Bob3RvLmpwZyIsImdpdmVuX25hbWUiOiJUZXRzdSIsImZhbWlseV9uYW1lIjoiWWFtYXpha2kiLCJsb2NhbGUiOiJlbiJ9.xm1QwEQ0BRXYSyoVzKWE90Smhcnc5Y1nSX_SNDODf6l0hqcbp7FDfJWwxvgQXAJpOL0wD2idggY4smWrwgeaW_R6mwxkYt20dLdHz_ZOzDBeHg9C3LEc_e5P9w_X5wOMT2j4S6u4WLE9IGJ9utUoW5PsFonhYnmisdRxOxymth-SXkuBK84uDBmtysK19oidD-ZdFmwnHvi1AP8qHrAzg-rG9GdbovcI9XyW1OkweVLIDfQLk_Fn7IP7X5b_1m41M-Evjahn9RCsYwbhqsiLtka1UdTO2leIJLntCb6EhU6iAB1GePk5l4UO6YwX9KCo8w_CruG2f7bwBtWMD2-Pxg');
        const creditCards = yield sskts.service.person.findCreditCards({
            auth: auth,
            personId: 'me'
        });
        debug('creditCards are', creditCards);
        const newCreditCard = yield sskts.service.person.addCreditCard({
            auth: auth,
            personId: 'me',
            creditCard: {
                cardNo: '4111111111111111',
                // cardPass: '111',
                expire: '2018',
                holderName: 'AA BB'
            }
        });
        debug('creditCard added', newCreditCard);
    });
}
main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err);
});
