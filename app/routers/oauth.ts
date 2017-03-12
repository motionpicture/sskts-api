/**
 * oauthルーター
 *
 * @ignore
 */
import * as express from 'express';
const router = express.Router();

import * as createDebug from 'debug';
import * as jwt from 'jsonwebtoken';

import validator from '../middlewares/validator';

const debug = createDebug('sskts-api:*');
// todo どこで定義するか
const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 1800;

router.post(
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
            jwt.sign(
                {
                    scope: req.body.scope.toString()
                },
                process.env.SSKTS_API_SECRET,
                {
                    expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS
                },
                (err, encoded) => {
                    debug(err, encoded);
                    if (err) {
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

export default router;
