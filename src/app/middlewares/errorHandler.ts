// tslint:disable-next-line:no-suspicious-comment
/**
 * エラーハンドラーミドルウェア
 *
 * TODO errの内容、エラーオブジェクトタイプによって、本来はステータスコードを細かくコントロールするべき
 * 現時点では、雑にコントロールしてある
 * @module middlewares/errorHandler
 */

import * as sskts from '@motionpicture/sskts-domain';
import { NextFunction, Request, Response } from 'express';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, SERVICE_UNAVAILABLE } from 'http-status';

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
        if (err instanceof sskts.factory.error.SSKTS) {
            switch (true) {
                case (err instanceof sskts.factory.error.ServiceUnavailable):
                    apiError = new APIError(SERVICE_UNAVAILABLE, [err]);
                    break;

                case (err instanceof sskts.factory.error.NotFound):
                    apiError = new APIError(NOT_FOUND, [err]);
                    break;

                default:
                    apiError = new APIError(BAD_REQUEST, [err]);
                    break;
            }
        } else {
            apiError = new APIError(INTERNAL_SERVER_ERROR, [{
                reason: <any>'internalServerError',
                message: err.message
            }]);
        }
    }

    res.status(apiError.code).json({
        error: {
            errors: apiError.errors,
            code: apiError.code,
            message: apiError.message
        }
    });
};
