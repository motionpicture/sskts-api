/**
 * oauthルーター
 *
 * @ignore
 */
import * as express from 'express';
const oauthRouter = express.Router();

import * as createDebug from 'debug';
import * as jwt from 'jsonwebtoken';

import validator from '../middlewares/validator';

const debug = createDebug('sskts-api:routes:oauth');
// todo どこで定義するか
const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 1800;

oauthRouter.post(
    '/token',
    (req, _, next) => {
        // req.checkBody('grant_type', 'invalid grant_type').notEmpty().withMessage('assertion is required')
        //     .equals('password');
        // req.checkBody('username', 'invalid username').notEmpty().withMessage('username is required');
        // req.checkBody('password', 'invalid password').notEmpty().withMessage('password is required');
        // req.checkBody('client_id', 'invalid client_id').notEmpty().withMessage('client_id is required');
        // req.checkBody('scope', 'invalid scope').notEmpty().withMessage('scope is required')
        //     .equals('admin');
        req.checkBody('assertion', 'invalid assertion').notEmpty().withMessage('assertion is required')
            .equals(process.env.SSKTS_API_REFRESH_TOKEN);
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

            const payload = {
                scopes: req.body.scopes
            };

            jwt.sign(
                payload,
                process.env.SSKTS_API_SECRET,
                {
                    expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS
                },
                (err: Error, encoded: string) => {
                    debug(err, encoded);
                    if (err instanceof Error) {
                        throw err;
                    } else {
                        debug('encoded is', encoded);

                        res.json({
                            access_token: encoded,
                            token_type: 'Bearer',
                            expires_in: ACCESS_TOKEN_EXPIRES_IN_SECONDS
                        });
                    }
                }
            );
        } catch (error) {
            next(error);
        }
    });

export default oauthRouter;
