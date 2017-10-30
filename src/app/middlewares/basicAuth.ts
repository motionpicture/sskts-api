/**
 * ベーシック認証ミドルウェア
 * @module middlewares.basicAuth
 */

import * as basicAuth from 'basic-auth';
import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { UNAUTHORIZED } from 'http-status';

const debug = createDebug('sskts-api:middlewares:basicAuth');

export default (req: Request, res: Response, next: NextFunction) => {
    // ベーシック認証のための環境変数設定なければスルー
    if (process.env.SSKTS_API_BASIC_AUTH_NAME === undefined || process.env.SSKTS_API_BASIC_AUTH_PASS === undefined) {
        next();

        return;
    }

    const user = basicAuth(req);
    debug('basic auth user:', user);
    if (user !== undefined
        && user.name === process.env.SSKTS_API_BASIC_AUTH_NAME
        && user.pass === process.env.SSKTS_API_BASIC_AUTH_PASS) {
        // 認証情報が正しければOK
        next();

        return;
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="sskts-api Authentication"');
    res.status(UNAUTHORIZED).end('Unauthorized');
};
