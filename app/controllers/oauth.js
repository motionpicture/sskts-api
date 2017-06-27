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
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const debug = createDebug('sskts-api:controllers:oauth');
// todo どこで定義するか
const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 1800;
exports.MESSAGE_UNIMPLEMENTED_GRANT_TYPE = 'grant_type not implemented';
exports.MESSAGE_CLIENT_NOT_FOUND = 'client not found';
exports.MESSAGE_INVALID_USERNAME_OR_PASSWORD = 'invalid username or password';
exports.MESSAGE_INVALID_ASSERTION = 'client not foundinvalid assertion';
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
            case 'client_credentials':
                return yield issueCredentialsByClient(req.body.client_id, req.body.state, req.body.scopes);
            case 'password':
                return yield issueCredentialsByPassword(req.body.username, req.body.password, req.body.scopes);
            default:
                // 非対応認可タイプ
                throw new Error(exports.MESSAGE_UNIMPLEMENTED_GRANT_TYPE);
        }
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
            throw new Error(exports.MESSAGE_INVALID_ASSERTION);
        }
        const payload = {
            scopes: scopes
        };
        return yield payload2credentials(payload);
    });
}
exports.issueCredentialsByAssertion = issueCredentialsByAssertion;
/**
 * クライアントIDから資格情報を発行する
 *
 * @param {string} clientId クライアントID
 * @param {string[]} scopes スコープリスト
 * @returns {Promise<ICredentials>} 資格情報
 */
function issueCredentialsByClient(clientId, state, scopes) {
    return __awaiter(this, void 0, void 0, function* () {
        // クライアントの存在確認
        const clientAdapter = sskts.adapter.client(mongoose.connection);
        const clientDoc = yield clientAdapter.clientModel.findById(clientId, 'name').exec();
        if (clientDoc === null) {
            throw new Error(exports.MESSAGE_CLIENT_NOT_FOUND);
        }
        const payload = {
            client: clientDoc.toObject(),
            state: state,
            scopes: scopes
        };
        return yield payload2credentials(payload);
    });
}
exports.issueCredentialsByClient = issueCredentialsByClient;
function issueCredentialsByPassword(username, password, scopes) {
    return __awaiter(this, void 0, void 0, function* () {
        // ログイン確認
        const ownerAdapter = sskts.adapter.owner(mongoose.connection);
        const memberOption = yield sskts.service.member.login(username, password)(ownerAdapter);
        if (memberOption.isEmpty) {
            throw new Error(exports.MESSAGE_INVALID_USERNAME_OR_PASSWORD);
        }
        const owner = memberOption.get();
        const payload = {
            owner: {
                id: owner.id,
                username: owner.username
            },
            scopes: scopes
        };
        return yield payload2credentials(payload);
    });
}
exports.issueCredentialsByPassword = issueCredentialsByPassword;
/**
 * 任意のデータをJWTを使用して資格情報へ変換する
 *
 * @param {object} payload 変換したいデータ
 * @returns {Promise<ICredentials>} 資格情報
 */
function payload2credentials(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            debug('signing...', payload);
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
