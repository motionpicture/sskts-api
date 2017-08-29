/**
 * エラーハンドラーミドルウェア
 *
 * todo errの内容、エラーオブジェクトタイプによって、本来はステータスコードを細かくコントロールするべき
 * 現時点では、雑にコントロールしてある
 * @module middlewares/errorHandler
 */

import * as sskts from '@motionpicture/sskts-domain';
import { NextFunction, Request, Response } from 'express';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, SERVICE_UNAVAILABLE } from 'http-status';

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
        if (err instanceof Error && err.name === 'SSKTSError') {
            if ((<any>err).code === sskts.errorCode.ServiceUnavailable) {
                apiError = new APIError(SERVICE_UNAVAILABLE, [{
                    title: 'Service Unavailable',
                    detail: err.message
                }]);
            } else {
                apiError = new APIError(BAD_REQUEST, [{
                    title: (<any>err).code,
                    detail: err.message
                }]);
            }
        } else {
            apiError = new APIError(INTERNAL_SERVER_ERROR, [{
                title: 'Internal Server Error',
                detail: err.message
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
