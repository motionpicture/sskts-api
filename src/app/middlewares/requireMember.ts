/**
 * 会員必須ミドルウェア
 *
 * @module middlewares/requireMember
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';

const debug = createDebug('sskts-api:middlewares:requireMember');

export default (req: Request, __: Response, next: NextFunction) => {
    // 会員としてログイン済みであればOK
    if (isMember(req.getUser())) {
        debug('logged in as', req.getUser().sub);
        next();

        return;
    }

    next(new sskts.factory.errors.Forbidden('login required'));
};

export function isMember(user: Express.IUser) {
    return (user.username !== undefined);
}
