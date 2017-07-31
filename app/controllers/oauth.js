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
const request = require("request-promise-native");
// tslint:disable-next-line:no-require-imports no-var-requires
const googleAuth = require('google-auth-library');
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
            // case 'password':
            //     return await issueCredentialsByPassword(
            //         req.body.client_id, req.body.state, req.body.username, req.body.password, req.body.scopes
            //     );
            default:
                // 非対応認可タイプ
                throw new Error(exports.MESSAGE_UNIMPLEMENTED_GRANT_TYPE);
        }
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
        // todo clientとstateどうするか
        const payload = sskts.factory.clientUser.create({
            client: '',
            state: '',
            scopes: scopes
        });
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
        const clientAdapter = sskts.adapter.client(sskts.mongoose.connection);
        const clientDoc = yield clientAdapter.clientModel.findById(clientId, '_id').exec();
        if (clientDoc === null) {
            throw new Error(exports.MESSAGE_CLIENT_NOT_FOUND);
        }
        const payload = sskts.factory.clientUser.create({
            client: clientId,
            state: state,
            scopes: scopes
        });
        return yield payload2credentials(payload);
    });
}
exports.issueCredentialsByClient = issueCredentialsByClient;
/**
 * Googleのid tokenから資格情報を発行する
 */
function issueCredentialsByGoogleToken(idToken, clientId, state, scopes) {
    return __awaiter(this, void 0, void 0, function* () {
        // クライアントの存在確認
        const clientAdapter = sskts.adapter.client(sskts.mongoose.connection);
        const clientDoc = yield clientAdapter.clientModel.findById(clientId, '_id').exec();
        if (clientDoc === null) {
            throw new Error(exports.MESSAGE_CLIENT_NOT_FOUND);
        }
        const userInfo = yield verifyGoogleIdToken(idToken);
        // 会員検索(なければ登録)
        const personAdapter = yield sskts.adapter.person(sskts.mongoose.connection);
        const person = {
            typeOf: 'Person',
            email: userInfo.email,
            givenName: '',
            familyName: '',
            telephone: '',
            memberOf: {
                openId: {
                    provider: userInfo.iss,
                    userId: userInfo.sub
                },
                hostingOrganization: {},
                membershipNumber: `${userInfo.iss}-${userInfo.sub}`,
                programName: 'シネマサンシャインプレミアム'
            }
        };
        const personDoc = yield personAdapter.personModel.findOneAndUpdate({
            'memberOf.openId.provider': person.memberOf.openId.provider,
            'memberOf.openId.userId': person.memberOf.openId.userId
        }, {
            $setOnInsert: person // 新規の場合のみ更新
        }, { new: true, upsert: true }).exec();
        if (personDoc === null) {
            throw new Error('member not found');
        }
        const payload = sskts.factory.clientUser.create({
            client: clientId,
            person: personDoc.toObject(),
            state: state,
            scopes: scopes
        });
        return yield payload2credentials(payload);
    });
}
exports.issueCredentialsByGoogleToken = issueCredentialsByGoogleToken;
function verifyGoogleIdToken(idToken) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            // idTokenをGoogleで検証
            const CLIENT_ID = '932934324671-66kasujntj2ja7c5k4k55ij6pakpqir4.apps.googleusercontent.com';
            const auth = new googleAuth();
            const client = new auth.OAuth2(CLIENT_ID, '', '');
            client.verifyIdToken(idToken, CLIENT_ID, 
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
            (error, login) => __awaiter(this, void 0, void 0, function* () {
                if (error !== null) {
                    reject(error);
                    return;
                }
                // todo audのチェック
                const payload = login.getPayload();
                debug('payload is', payload);
                // const userId = payload.sub;
                // If request specified a G Suite domain:
                //var domain = payload['hd'];
                resolve(payload);
            }));
        });
    });
}
/**
 * LINEの認可コードから資格情報を発行する
 */
function issueCredentialsByLINEAuthorizationCode(code, redirectUri, clientId, state, scopes) {
    return __awaiter(this, void 0, void 0, function* () {
        // クライアントの存在確認
        const clientAdapter = sskts.adapter.client(sskts.mongoose.connection);
        const clientDoc = yield clientAdapter.clientModel.findById(clientId, '_id').exec();
        if (clientDoc === null) {
            throw new Error(exports.MESSAGE_CLIENT_NOT_FOUND);
        }
        const form = {
            grant_type: 'authorization_code',
            client_id: '1527681488',
            client_secret: 'cf3540f8c004f9e8926a5090ae6a036d',
            code: code,
            redirect_uri: redirectUri
        };
        debug('getting an access token...', form);
        const accessToken = yield request.post({
            url: 'https://api.line.me/v2/oauth/accessToken',
            form: form,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            useQuerystring: true
        }).then((response) => {
            debug(response.body);
            return response.body.access_token;
        });
        debug('an access token got', accessToken);
        // LINEプロフィール取得
        debug('getting user profiles...');
        const profile = yield request.get({
            url: 'https://api.line.me/v2/profile',
            auth: { bearer: accessToken },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            useQuerystring: true
        }).then((response) => {
            debug(response.body);
            return response.body;
        });
        debug('profile is', profile);
        // 会員検索(なければ登録)
        const personAdapter = yield sskts.adapter.person(sskts.mongoose.connection);
        const person = {
            typeOf: 'Person',
            email: '',
            givenName: '',
            familyName: '',
            telephone: '',
            memberOf: {
                openId: {
                    provider: 'LINE',
                    userId: profile.userId
                },
                hostingOrganization: {},
                membershipNumber: `LINE-${profile.userId}`,
                programName: 'シネマサンシャインプレミアム'
            }
        };
        const personDoc = yield personAdapter.personModel.findOneAndUpdate({
            'memberOf.openId.provider': person.memberOf.openId.provider,
            'memberOf.openId.userId': person.memberOf.openId.userId
        }, {
            $setOnInsert: person // 新規の場合のみ更新
        }, { new: true, upsert: true }).exec();
        if (personDoc === null) {
            throw new Error('member not found');
        }
        const payload = sskts.factory.clientUser.create({
            client: clientId,
            person: personDoc.toObject(),
            state: state,
            scopes: scopes
        });
        return yield payload2credentials(payload);
    });
}
exports.issueCredentialsByLINEAuthorizationCode = issueCredentialsByLINEAuthorizationCode;
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
