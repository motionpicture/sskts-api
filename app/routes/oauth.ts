/**
 * oauthルーター
 *
 * @ignore
 */

// import * as createDebug from 'debug';
import * as express from 'express';

const oauthRouter = express.Router();

import * as oauthController from '../controllers/oauth';
import validator from '../middlewares/validator';

// const debug = createDebug('sskts-api:routes:oauth');

oauthRouter.post(
    '/token',
    (req, _, next) => {
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
    },
    validator,
    async (req, res, next) => {
        try {
            // 資格情報を発行する
            const credentials = await oauthController.issueCredentials(req);
            res.json(credentials);
        } catch (error) {
            next(error);
        }
    }
);

oauthRouter.post(
    '/token/signInWithGoogle',
    validator,
    // tslint:disable-next-line:max-func-body-length
    async (req, res, next) => {
        try {
            // 資格情報を発行する
            const credentials = await oauthController.issueCredentialsByGoogleToken(
                req.body.idToken, req.body.client_id, req.body.state, req.body.scopes
            );
            res.json(credentials);
        } catch (error) {
            next(error);
        }
    }
);

oauthRouter.post(
    '/token/signInWithLINE',
    validator,
    // tslint:disable-next-line:max-func-body-length
    async (req, res, next) => {
        try {
            // 資格情報を発行する
            const credentials = await oauthController.issueCredentialsByLINEAuthorizationCode(
                req.body.code, req.body.redirectUri, req.body.client_id, req.body.state, req.body.scopes
            );
            res.json(credentials);
        } catch (error) {
            next(error);
        }
    }
);

export default oauthRouter;
