/**
 * クレジットカード検索サンプル
 *
 * @ignore
 */

import * as createDebug from 'debug';

import * as sskts from '../lib/sskts-api';

const debug = createDebug('sskts-api:samples');

async function main() {
    const auth = new sskts.auth.OAuth2(
        'motionpicture',
        '',
        'teststate',
        ['people.creditCards']
    );

    // Googleから受け取ったid_tokenを使ってサインイン
    await auth.signInWithGoogle(
        // tslint:disable-next-line:max-line-length
        'eyJhbGciOiJSUzI1NiIsImtpZCI6IjU2NjE5YWRiMjJkMWE1NDU2MjAzNmJmNTEwODBmZjZjZjdjZTNjZjIifQ.eyJhenAiOiI5MzI5MzQzMjQ2NzEtNjZrYXN1am50ajJqYTdjNWs0azU1aWo2cGFrcHFpcjQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5MzI5MzQzMjQ2NzEtNjZrYXN1am50ajJqYTdjNWs0azU1aWo2cGFrcHFpcjQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDgwMTczNzA5ODQ2NDQ2NDkyODgiLCJlbWFpbCI6Imlsb3ZlZ2FkZEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6ImFlRGE3b0xlTDg3dlZJOFY5SmdfTkEiLCJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiaWF0IjoxNTAxNTQ4NDQwLCJleHAiOjE1MDE1NTIwNDAsIm5hbWUiOiJUZXRzdSBZYW1hemFraSIsInBpY3R1cmUiOiJodHRwczovL2xoNi5nb29nbGV1c2VyY29udGVudC5jb20vLVRpM29LMmwxNmJzL0FBQUFBQUFBQUFJL0FBQUFBQUFBNjNNL01Dc0JlWWNpWnpJL3M5Ni1jL3Bob3RvLmpwZyIsImdpdmVuX25hbWUiOiJUZXRzdSIsImZhbWlseV9uYW1lIjoiWWFtYXpha2kiLCJsb2NhbGUiOiJlbiJ9.xm1QwEQ0BRXYSyoVzKWE90Smhcnc5Y1nSX_SNDODf6l0hqcbp7FDfJWwxvgQXAJpOL0wD2idggY4smWrwgeaW_R6mwxkYt20dLdHz_ZOzDBeHg9C3LEc_e5P9w_X5wOMT2j4S6u4WLE9IGJ9utUoW5PsFonhYnmisdRxOxymth-SXkuBK84uDBmtysK19oidD-ZdFmwnHvi1AP8qHrAzg-rG9GdbovcI9XyW1OkweVLIDfQLk_Fn7IP7X5b_1m41M-Evjahn9RCsYwbhqsiLtka1UdTO2leIJLntCb6EhU6iAB1GePk5l4UO6YwX9KCo8w_CruG2f7bwBtWMD2-Pxg'
    );

    const creditCards = await sskts.service.person.findMyCreditCards({
        auth: auth
    });
    debug('creditCards are', creditCards);
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err);
});
