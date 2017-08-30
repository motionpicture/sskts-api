/**
 * 会員必須ミドルウェア
 *
 * @module middlewares/requireMember
 */

import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { FORBIDDEN } from 'http-status';

import { APIError } from '../error/api';

const debug = createDebug('sskts-api:middlewares:requireMember');

export default (req: Request, __: Response, next: NextFunction) => {
    // 会員としてログイン済みであればOK
    if (isMember(req.getUser())) {
        debug('logged in as', req.getUser().sub);
        next();

        return;
    }

    next(new APIError(FORBIDDEN, [{
        reason: <any>'Forbidden',
        message: 'login required'
    }]));
};

export function isMember(user: Express.IUser) {
    return (user.username !== undefined);
}
