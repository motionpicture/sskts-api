/**
 * oauthルーター
 *
 * @ignore
 */

import * as createDebug from 'debug';
import * as express from 'express';
// import * as querystring from 'querystring';

const oauthRouter = express.Router();

import * as oauthController from '../controllers/oauth';
import validator from '../middlewares/validator';

const debug = createDebug('sskts-api:routes:oauth');

// oauthRouter.get(
//     '/authorize',
//     (req, __, next) => {
//         //     GET /authorize?response_type=token&client_id=s6BhdRkqt3&state=xyz
//         //   &redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcb HTTP/1.1
//         // response_type
//         // 必須(REQUIRED).値は必ず token にしなければならない (MUST).
//         //     client_id
//         // 必須(REQUIRED).詳細は Section 2.2 を参照のこと.
//         //     redirect_uri
//         // 任意(OPTIONAL).詳細は Section 3.1.2 を参照のこと.
//         //     scope
//         // 任意(OPTIONAL).詳細は Section 3.3 を参照のこと.
//         //     state
//         // 推奨(RECOMMENDED).
//         // リクエストとコールバックの間で状態を維持するために使用するランダムな値.
//         // 認可サーバーはリダイレクトによってクライアントに処理を戻す際にこの値を付与する.

//         // 認可タイプによってチェック項目が異なる
//         switch (req.query.response_type) {
//             case 'token':
//                 break;

//             default:
//                 next(new Error('response_type not implemented'));

//                 return;
//         }

//         next();
//     },
//     validator,
//     async (req, res, next) => {
//         try {
//             // access_token
//             // 必須(REQUIRED).認可サーバーによって発行されたアクセストークン.
//             //     token_type
//             // 必須(REQUIRED).詳細は Section 7.1 を参照のこと.大文字・小文字は区別しない.
//             //     expires_in
//             // 推奨(RECOMMENDED).アクセストークンの有効期間を秒で表したもの
//             //     scope
//             // クライアントによって要求された scope と同一の場合は任意 (OPTIONAL).その他の場合は必須(REQUIRED).詳細は Section 3.3 を参照のこと.
//             //     state
//             // クライアントの認可リクエストに state が含まれていた場合は必須 (REQUIRED).クライアントから受け取った値をそのまま返す.
//             //     認可サーバーはリフレッシュトークンを発行してはならない(MUST NOT).

//             // todo クライアントとリダイレクトURIの検証

//             // 資格情報を発行する
//             const credentials = await oauthController.issueCredentialsByClient(
//                 req.query.client_id,
//                 req.query.state,
//                 req.query.scope
//             );

//             // リダイレクト
//             const url = `${req.query.redirect_uri}?${querystring.stringify({ ...credentials, ...{ state: req.query.state } })}`;
//             res.redirect(url);
//         } catch (error) {
//             next(error);
//         }
//     }
// );

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

        req.checkBody('scope', 'invalid scope').notEmpty().withMessage('scope is required');

        // 認可タイプによってチェック項目が異なる
        switch (req.body.grant_type) {
            // case 'urn:ietf:params:oauth:grant-type:jwt-bearer':
            //     req.checkBody('assertion', 'invalid assertion').notEmpty().withMessage('assertion is required');
            //     break;

            case 'client_credentials':
                req.checkBody('client_id', 'invalid client_id').notEmpty().withMessage('client_id is required');
                req.checkBody('client_secret', 'invalid client_secret').notEmpty().withMessage('client_secret is required');
                req.checkBody('state', 'invalid state').notEmpty().withMessage('state is required');

                break;

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
    async (req, res, next) => {
        try {
            // 資格情報を発行する
            debug(typeof req.body);
            debug('issueing credentials by google token...', req.body);
            const scopes = (<string>req.body.scope).split(' ');
            const credentials = await oauthController.issueCredentialsByGoogleToken(
                req.body.id_token, req.body.client_id, req.body.state, scopes
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
            const scopes = (<string>req.body.scope).split(' ');
            const credentials = await oauthController.issueCredentialsByLINEAuthorizationCode(
                req.body.code, req.body.redirect_uri, req.body.client_id, req.body.state, scopes
            );
            res.json(credentials);
        } catch (error) {
            next(error);
        }
    }
);

export default oauthRouter;
