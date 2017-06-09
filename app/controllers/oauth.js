"use strict";
/**
 * oauthコントローラー
 *
 * @namespace controllers/oauth
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
const jwt = require("jsonwebtoken");
const debug = createDebug('sskts-api:controllers:oauth');
// todo どこで定義するか
const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 1800;
/**
 * 資格情報を発行する
 *
 * @param {Request} req リクエストオブジェクト
 * @returns {Promise<ICredentials>} 資格情報
 */
function issueCredentials(req) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (req.body.grant_type) {
            case 'urn:ietf:params:oauth:grant-type:jwt-bearer':
                return yield issueCredentialsByAssertion(req.body.assertion, req.body.scopes);
            default:
                // 非対応認可タイプ
                throw new Error('grant_type not implemented');
        }
        // client_idの存在確認
        // const numberOfClient = await chevre.Models.Client.count({ _id: req.body.client_id }).exec();
        // debug('numberOfClient:', numberOfClient);
        // if (numberOfClient === 0) {
        //     throw new Error('client not found');
        // }
        // usernameとpassword照合
        // const owner = await chevre.Models.Owner.findOne({ username: req.body.username }).exec();
        // if (owner === null) {
        //     throw new Error('owner not found');
        // }
        // if (owner.get('password_hash') !== chevre.CommonUtil.createHash(req.body.password, owner.get('password_salt'))) {
        //     throw new Error('invalid username or password');
        // }
    });
}
exports.issueCredentials = issueCredentials;
/**
 * 主張から資格情報を発行する
 *
 * @param {string} assertion 主張
 * @param {string[]} scopes スコープリスト
 * @returns {Promise<ICredentials>} 資格情報
 */
function issueCredentialsByAssertion(assertion, scopes) {
    return __awaiter(this, void 0, void 0, function* () {
        if (assertion !== process.env.SSKTS_API_REFRESH_TOKEN) {
            throw new Error('invalid assertion');
        }
        const payload = {
            scopes: scopes
        };
        return yield payload2credentials(payload);
    });
}
exports.issueCredentialsByAssertion = issueCredentialsByAssertion;
/**
 * 任意のデータをJWTを使用して資格情報へ変換する
 *
 * @param {object} payload 変換したいデータ
 * @returns {Promise<ICredentials>} 資格情報
 */
function payload2credentials(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            jwt.sign(payload, process.env.SSKTS_API_SECRET, {
                expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS
            }, (err, encoded) => {
                debug('jwt signed', err, encoded);
                if (err instanceof Error) {
                    reject(err);
                }
                else {
                    resolve({
                        access_token: encoded,
                        token_type: 'Bearer',
                        expires_in: ACCESS_TOKEN_EXPIRES_IN_SECONDS
                    });
                }
            });
        });
    });
}
exports.payload2credentials = payload2credentials;
