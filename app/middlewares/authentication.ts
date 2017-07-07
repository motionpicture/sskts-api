/**
 * oauthミドルウェア
 *
 * @module middlewares/authentication
 */

import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'express-jwt';

const debug = createDebug('sskts-api:middlewares:authentication');

export default [
    jwt(
        {
            secret: process.env.SSKTS_API_SECRET
        }
    ),
    (req: Request, __: Response, next: NextFunction) => {
        debug('req.user:', req.user);
        // todo getUserメソッドを宣言する場所はここでよい？
        // oauthを通過した場合のみ{req.user}を使用するはずなので、これで問題ないはず。
        req.getUser = () => req.user;

        next();
    }
];
