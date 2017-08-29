/**
 * 404ハンドラーミドルウェア
 *
 * @module middlewares/notFoundHandler
 */

import { NextFunction, Request, Response } from 'express';
import { NOT_FOUND } from 'http-status';

import { APIError } from '../error/api';

export default (req: Request, __: Response, next: NextFunction) => {
    next(new APIError(NOT_FOUND, [{
        title: 'NotFound',
        detail: `router for [${req.originalUrl}] not found.`
    }]));
};
