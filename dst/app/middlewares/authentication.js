"use strict";
/**
 * oauthミドルウェア
 *
 * @module middlewares/authentication
 * @see https://aws.amazon.com/blogs/mobile/integrating-amazon-cognito-user-pools-with-api-gateway/
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
// import * as jwt from 'express-jwt';
// import * as fs from 'fs';
const http_status_1 = require("http-status");
const jwt = require("jsonwebtoken");
// const jwkToPem = require('jwk-to-pem');
const debug = createDebug('sskts-api:middlewares:authentication');
// const ISSUER = 'https://cognito-identity.amazonaws.com';
const ISSUER = process.env.TOKEN_ISSUER;
// const permittedAudiences = [
//     '4flh35hcir4jl73s3puf7prljq',
//     '6figun12gcdtlj9e53p2u3oqvl'
// ];
// tslint:disable-next-line:no-require-imports no-var-requires
const pemsFromJson = require('../../../certificate/pems.json');
exports.default = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        let token = null;
        if (typeof req.headers.authorization === 'string' && req.headers.authorization.split(' ')[0] === 'Bearer') {
            token = req.headers.authorization.split(' ')[1];
        }
        if (token === null) {
            throw new Error('authorization required');
        }
        const payload = yield validateToken(pemsFromJson, token);
        debug('verified! payload:', payload);
        req.user = payload;
        req.accessToken = token;
        // アクセストークンにはscopeとして定義されているので、scopesに変換
        if (req.user.scopes === undefined) {
            req.user.scopes = (typeof req.user.scope === 'string') ? req.user.scope.split((' ')) : [];
        }
        // todo getUserメソッドを宣言する場所はここでよい？
        // oauthを通過した場合のみ{req.user}を使用するはずなので、これで問題ないはず。
        req.getUser = () => req.user;
        next();
    }
    catch (error) {
        console.error(error);
        res.status(http_status_1.UNAUTHORIZED).end('Unauthorized');
    }
});
// export async function createPems() {
//     const openidConfiguration: IOpenIdConfiguration = await request({
//         url: `${ISSUER}/.well-known/openid-configuration`,
//         json: true
//     }).then((body) => body);
//     const pems = await request({
//         url: openidConfiguration.jwks_uri,
//         json: true
//     }).then((body) => {
//         console.log('got jwks_uri', body);
//         const pemsByKid: IPems = {};
//         (<any[]>body['keys']).forEach((key) => {
//             pemsByKid[key.kid] = jwkToPem(key);
//         });
//         return pemsByKid;
//     });
//     await fs.writeFile(`${__dirname}/pems.json`, JSON.stringify(pems));
//     return pems;
// };
function validateToken(pems, token) {
    return __awaiter(this, void 0, void 0, function* () {
        debug('validating token...');
        const decodedJwt = jwt.decode(token, { complete: true });
        if (!decodedJwt) {
            throw new Error('invalid JWT token');
        }
        debug('decodedJwt:', decodedJwt);
        // if (decodedJwt.payload.aud !== AUDIENCE) {
        //     throw new Error('invalid audience');
        // }
        // Reject the jwt if it's not an 'Access Token'
        if (decodedJwt.payload.token_use !== 'access') {
            throw new Error('not an access token');
        }
        // Get the kid from the token and retrieve corresponding PEM
        const pem = pems[decodedJwt.header.kid];
        if (pem === undefined) {
            throw new Error(`corresponding pem undefined. kid:${decodedJwt.header.kid}`);
        }
        return new Promise((resolve, reject) => {
            // Verify the signature of the JWT token to ensure it's really coming from your User Pool
            jwt.verify(token, pem, {
                issuer: ISSUER
                // audience: pemittedAudiences
            }, (err, payload) => {
                if (err !== null) {
                    reject(err);
                }
                else {
                    // Always generate the policy on value of 'sub' claim and not for 'username' because username is reassignable
                    // sub is UUID for a user which is never reassigned to another user
                    resolve(payload);
                }
            });
        });
    });
}
exports.validateToken = validateToken;
