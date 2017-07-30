"use strict";
/**
 * oauthルーター
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
const express = require("express");
// tslint:disable-next-line:no-require-imports no-var-requires
const googleAuth = require('google-auth-library');
const oauthRouter = express.Router();
const oauthController = require("../controllers/oauth");
const validator_1 = require("../middlewares/validator");
const debug = createDebug('sskts-api:routes:oauth');
oauthRouter.post('/token', (req, _, next) => {
    // 認可タイプ未指定であれば強制的にJWT Bearer Tokenタイプに
    // if (typeof req.body.grant_type !== 'string') {
    //     req.body.grant_type = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
    // }
    // req.checkBody('scope', 'invalid scope').optional().notEmpty().withMessage('scope is required')
    //     .equals('admin');
    // スコープ指定があれば配列に変換
    // スコープ指定は当初「admin」のみ受け付けていたので、これで互換性が保たれる
    // if (req.body.scope === 'admin') {
    //     req.body.scopes = ['admin'];
    // }
    req.checkBody('scopes', 'invalid scopes').notEmpty().withMessage('scopes is required');
    // 認可タイプによってチェック項目が異なる
    switch (req.body.grant_type) {
        // case 'urn:ietf:params:oauth:grant-type:jwt-bearer':
        //     req.checkBody('assertion', 'invalid assertion').notEmpty().withMessage('assertion is required');
        //     break;
        case 'client_credentials':
            req.checkBody('client_id', 'invalid client_id').notEmpty().withMessage('client_id is required');
            req.checkBody('state', 'invalid state').notEmpty().withMessage('state is required');
            break;
        // case 'password':
        //     req.checkBody('client_id', 'invalid client_id').notEmpty().withMessage('client_id is required');
        //     req.checkBody('state', 'invalid state').notEmpty().withMessage('state is required');
        //     req.checkBody('username', 'invalid username').notEmpty().withMessage('username is required');
        //     req.checkBody('password', 'invalid password').notEmpty().withMessage('password is required');
        //     break;
        default:
    }
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        // 資格情報を発行する
        const credentials = yield oauthController.issueCredentials(req);
        res.json(credentials);
    }
    catch (error) {
        next(error);
    }
}));
oauthRouter.post('/token/signInWithGoogle', validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        // 資格情報を発行する
        const credentials = yield oauthController.payload2credentials({
            person: {
                id: '12345'
            },
            state: req.body.state,
            scopes: req.body.scopes
        });
        res.json(credentials);
        // idTokenをGoogleで検証
        // const CLIENT_ID = '932934324671-66kasujntj2ja7c5k4k55ij6pakpqir4.apps.googleusercontent.com';
        // const auth = new googleAuth();
        // const client = new auth.OAuth2(CLIENT_ID, '', '');
        // client.verifyIdToken(
        //     req.body.idToken,
        //     CLIENT_ID,
        //     // Or, if multiple clients access the backend:
        //     //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
        //     async (error: any, login: any) => {
        //         if (error !== null) {
        //             next(error);
        //             return;
        //         }
        //         const payload = login.getPayload();
        //         debug('payload is', payload);
        //         // const userid = payload.sub;
        //         // If request specified a G Suite domain:
        //         //var domain = payload['hd'];
        //         // 資格情報を発行する
        //         const credentials = await oauthController.payload2credentials(<any>{
        //             email: payload.email,
        //             name: payload.name
        //         });
        //         res.json(credentials);
        //     });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = oauthRouter;
