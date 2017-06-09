/**
 * oauthルーター
 *
 * @ignore
 */

import * as express from 'express';
const oauthRouter = express.Router();

import * as oauthController from '../controllers/oauth';
import validator from '../middlewares/validator';

oauthRouter.post(
    '/token',
    (req, _, next) => {
        // 認可タイプ未指定であれば強制的にJWT Bearer Tokenタイプに
        if (typeof req.body.grant_type !== 'string') {
            req.body.grant_type = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
        }

        req.checkBody('grant_type', 'invalid grant_type').notEmpty().withMessage('grant_type is required');
        // req.checkBody('username', 'invalid username').notEmpty().withMessage('username is required');
        // req.checkBody('password', 'invalid password').notEmpty().withMessage('password is required');
        // req.checkBody('client_id', 'invalid client_id').notEmpty().withMessage('client_id is required');
        // req.checkBody('scope', 'invalid scope').notEmpty().withMessage('scope is required')
        // //     .equals('admin');
        req.checkBody('scope', 'invalid scope').optional().notEmpty().withMessage('scope is required')
            .equals('admin');

        // スコープ指定があれば配列に変換
        // スコープ指定は当初「admin」のみ受け付けていたので、これで互換性が保たれる
        if (req.body.scope === 'admin') {
            req.body.scopes = ['admin'];
        }

        req.checkBody('scopes', 'invalid scopes').notEmpty().withMessage('scopes is required');

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
    });

export default oauthRouter;
