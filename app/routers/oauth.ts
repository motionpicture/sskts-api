/**
 * oauthルーター
 *
 * @ignore
 */
import * as express from 'express';
const router = express.Router();

import * as createDebug from 'debug';
import * as jwt from 'jsonwebtoken';

const debug = createDebug('sskts-api:*');
// todo どこで定義するか
const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 1800;

router.post('/token', async (req, res, next) => {
    debug(req.body);
    try {
        const assertion = req.body.assertion.toString();

        // todo メッセージ調整
        if (assertion !== process.env.sskts_API_REFRESH_TOKEN) {
            return next(new Error('invalid assertion.'));
        }

        jwt.sign(
            {
                scope: req.body.scope.toString()
            },
            process.env.sskts_API_SECRET,
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
