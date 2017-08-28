/**
 * エラーハンドラーミドルウェア
 *
 * todo errの内容、エラーオブジェクトタイプによって、本来はステータスコードを細かくコントロールするべき
 * 現時点では、雑にコントロールしてある
 * @module middlewares/errorHandler
 */

import { NextFunction, Request, Response } from 'express';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK, UNAUTHORIZED } from 'http-status';
import logger from '../logger';

export default (err: any, __: Request, res: Response, next: NextFunction) => {
    logger.error('sskts-api:middleware:errorHandler', err);

    if (res.headersSent) {
        next(err);

        return;
    }

    let statusCode = (res.statusCode !== OK) ? res.statusCode : undefined;
    const errors: any[] = [];
    let message: string = '';

    // エラーオブジェクトの場合は、キャッチされた例外でクライント依存のエラーの可能性が高い
    if (err instanceof Error) {
        // oauth認証失敗
        if (err.name === 'UnauthorizedError') {
            statusCode = UNAUTHORIZED;
            errors.push(
                {
                    title: err.name,
                    detail: err.message
                }
            );
            message = err.message;
        } else {
            statusCode = (statusCode === undefined) ? BAD_REQUEST : statusCode;
            errors.push(
                {
                    title: err.name,
                    detail: err.message
                }
            );
            message = err.message;
        }
    } else {
        statusCode = (statusCode === undefined) ? INTERNAL_SERVER_ERROR : statusCode;
        errors.push(
            {
                title: 'Internal Server Error',
                detail: 'Internal Server Error'
            }
        );
        message = 'Internal Server Error';
    }

    res.status(statusCode).json({
        error: {
            errors: errors,
            code: statusCode,
            message: message
        }
    });
};
