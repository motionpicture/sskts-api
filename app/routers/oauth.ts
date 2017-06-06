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

const debug = createDebug('sskts-api:*');
// todo どこで定義するか
const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 1800;

oauthRouter.post(
    '/token',
    (req, _, next) => {
        req.checkBody('assertion', 'invalid assertion').notEmpty().withMessage('assertion is required')
            .equals(process.env.SSKTS_API_REFRESH_TOKEN);
        req.checkBody('scope', 'invalid scope').notEmpty().withMessage('scope is required')
            .equals('admin');

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const payload = {
                scope: req.body.scope.toString()
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
