/**
 * 404ハンドラーミドルウェア
 *
 * @module middlewares/notFoundHandler
 */

import { NextFunction, Request, Response } from 'express';
import { NOT_FOUND } from 'http-status';

export default (req: Request, res: Response, next: NextFunction) => {
    res.status(NOT_FOUND);
    next(new Error(`router for [${req.originalUrl}] not found.`));
};
