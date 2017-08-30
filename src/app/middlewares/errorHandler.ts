/**
 * error handler
 * エラーハンドラーミドルウェア
 * @module middlewares/errorHandler
 */

import * as sskts from '@motionpicture/sskts-domain';
import { NextFunction, Request, Response } from 'express';
import { BAD_REQUEST, FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND, SERVICE_UNAVAILABLE, UNAUTHORIZED } from 'http-status';

import { APIError } from '../error/api';
import logger from '../logger';

export default (err: any, __: Request, res: Response, next: NextFunction) => {
    logger.error('sskts-api:middleware:errorHandler', err);

    if (res.headersSent) {
        next(err);

        return;
    }

    let apiError: APIError;
    if (err instanceof APIError) {
        apiError = err;
    } else {
        if (err instanceof sskts.factory.errors.SSKTS) {
            switch (true) {
                // 401
                case (err instanceof sskts.factory.errors.Unauthorized):
                    apiError = new APIError(UNAUTHORIZED, [err]);
                    break;

                // 403
                case (err instanceof sskts.factory.errors.Forbidden):
                    apiError = new APIError(FORBIDDEN, [err]);
                    break;

                // 404
                case (err instanceof sskts.factory.errors.NotFound):
                    apiError = new APIError(NOT_FOUND, [err]);
                    break;

                // 503
                case (err instanceof sskts.factory.errors.ServiceUnavailable):
                    apiError = new APIError(SERVICE_UNAVAILABLE, [err]);
                    break;

                // 400
                default:
                    apiError = new APIError(BAD_REQUEST, [err]);
                    break;
            }
        } else {
            // 500
            apiError = new APIError(INTERNAL_SERVER_ERROR, [new sskts.factory.errors.SSKTS(<any>'InternalServerError', err.message)]);
        }
    }

    res.status(apiError.code).json({
        error: apiError.toObject()
    });
};
