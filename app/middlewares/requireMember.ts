/**
 * 会員必須ミドルウェア
 *
 * @module middlewares/requireMember
 */

import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { FORBIDDEN } from 'http-status';

const debug = createDebug('sskts-api:middlewares:requireMember');

export default (req: Request, res: Response, next: NextFunction) => {
    // 会員としてログイン済みであればOK
    if (isMember(req.getUser())) {
        debug('logged in as owner', req.getUser().person);
        next();

        return;
    }

    res.status(FORBIDDEN).end('Forbidden');
};

export function isMember(user: Express.IUser) {
    return (user.person !== undefined);
}
