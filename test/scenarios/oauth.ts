/**
 * OAuthシナリオ
 *
 * @ignore
 */

import * as httpStatus from 'http-status';
import * as mongoose from 'mongoose';
import * as supertest from 'supertest';

import * as app from '../../app/app';

let connection: mongoose.Connection;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});

/**
 * 管理者としてログインする
 *
 * @export
 * @returns {Promise<string>} アクセストークン
 */
export async function loginAsAdmin(): Promise<string> {
    return await supertest(app)
        .post('/oauth/token')
        .send({
            assertion: process.env.SSKTS_API_REFRESH_TOKEN,
            scope: 'admin'
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(httpStatus.OK)
        .then((response) => <string>response.body.access_token);
}

/**
 * クライアントとしてログインする
 *
 * @export
 * @param {string} clientId クライアントID
 * @param {string[]} scopes スコープリスト
 * @param {string} state 状態
 * @returns {Promise<string>} アクセストークン
 */
export async function loginAsClient(clientId: string, scopes: string[], state: string): Promise<string> {
    return await supertest(app)
        .post('/oauth/token')
        .send({
            grant_type: 'client_credentials',
            client_id: clientId,
            scopes: scopes,
            state: state
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(httpStatus.OK)
        .then((response) => <string>response.body.access_token);
}

/**
 * 会員としてログインする
 *
 * @export
 * @param {string} username ユーザーネーム
 * @param {string} password パスワード
 * @param {string[]} scopes スコープリスト
 * @returns {Promise<string>} アクセストークン
 */
export async function loginAsMember(username: string, password: string, scopes: string[]): Promise<string> {
    return await supertest(app)
        .post('/oauth/token')
        .send({
            grant_type: 'password',
            scopes: scopes,
            username: username,
            password: password
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(httpStatus.OK)
        .then((response) => <string>response.body.access_token);
}
