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
        'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY3ODU2OGM4YWRiMmVjYzA3ZDE0M2RiNTE0Y2M3YTk5NTIwN2RmMzYifQ.eyJhenAiOiI5MzI5MzQzMjQ2NzEtNjZrYXN1am50ajJqYTdjNWs0azU1aWo2cGFrcHFpcjQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5MzI5MzQzMjQ2NzEtNjZrYXN1am50ajJqYTdjNWs0azU1aWo2cGFrcHFpcjQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDgwMTczNzA5ODQ2NDQ2NDkyODgiLCJlbWFpbCI6Imlsb3ZlZ2FkZEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IjhCOXZSYUsycko0WVI0eGotV192ZHciLCJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiaWF0IjoxNTAxNDg1NjMwLCJleHAiOjE1MDE0ODkyMzAsIm5hbWUiOiJUZXRzdSBZYW1hemFraSIsInBpY3R1cmUiOiJodHRwczovL2xoNi5nb29nbGV1c2VyY29udGVudC5jb20vLVRpM29LMmwxNmJzL0FBQUFBQUFBQUFJL0FBQUFBQUFBNjNNL01Dc0JlWWNpWnpJL3M5Ni1jL3Bob3RvLmpwZyIsImdpdmVuX25hbWUiOiJUZXRzdSIsImZhbWlseV9uYW1lIjoiWWFtYXpha2kiLCJsb2NhbGUiOiJlbiJ9.CaYx1IjKe49QxP6zrRs5j8yzntKfROYPMwG4pBJjr_P1zrjzpOmPkRQkN_X240UOJfJi7bonVXU2aPfPvjHzov6OO6U5PTVR4X-Em_7V5h52LBDiwHYfSCURbFGP9fEH3Spp-K-HdNWmIkVw8o-k2YHC5wtSa1FcpumlHBfW_4d_oNy3vb8zJnl1l-puXHM0tSGiIks-q3FVuyqNglhKOeujmNR2i6m9uFr3YAdSaZ4l9mJxL5KnMwEVZckgJexYQjVWRbR4jKytLk19vH4Y39fdJhuM3q0msiW39V0pfkjyS8hvm7QrluCucDCfeHO7DwQQ2Xf1oQy5F8s9_aArXA');
        let creditCards = yield sskts.service.person.findMyCreditCards({
            auth: auth
        });
        debug('creditCards are', creditCards);
        yield sskts.service.person.addMyCreditCard({
            auth: auth,
            creditCard: {
                cardNo: '4111111111111111',
                // cardPass: '111',
                expire: '2018',
                holderName: 'AA BB'
            }
        });
        debug('creditCard added');
        creditCards = yield sskts.service.person.findMyCreditCards({
            auth: auth
        });
        debug('creditCards are', creditCards);
    });
}
main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err);
});
