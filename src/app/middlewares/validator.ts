/**
 * バリデータミドルウェア
 *
 * リクエストのパラメータ(query strings or body parameters)に対するバリデーション
 * @module middlewares/validator
 */

import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { BAD_REQUEST } from 'http-status';

const debug = createDebug('sskts-api:middlewares:validator');

export default async (req: Request, res: Response, next: NextFunction) => {
    const validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        const errors = validatorResult.array().map((mappedRrror) => {
            return {
                source: { parameter: mappedRrror.param },
                title: 'invalid parameter',
                detail: mappedRrror.msg
            };
        });
        debug('responding...', errors);

        res.status(BAD_REQUEST);
        res.json({
            errors: errors
        });

        return;
    }

    next();
};
