/**
 * エラーハンドラーミドルウェア
 */
import { NextFunction, Request, Response } from 'express';
import { INTERNAL_SERVER_ERROR } from 'http-status';

export default (err: Error, _: Request, res: Response, next: NextFunction) => {
    console.error(err);

    if (res.headersSent) {
        next(err);
        return;
    }

    res.status(INTERNAL_SERVER_ERROR);
    res.json({
        errors: [
            {
                title: 'internal server error',
                detail: 'an unexpected error occurred.'
            }
        ]
    });
};
