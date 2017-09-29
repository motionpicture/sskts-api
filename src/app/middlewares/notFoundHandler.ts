/**
 * 404ハンドラーミドルウェア
 * @module middlewares.notFoundHandler
 */

import * as sskts from '@motionpicture/sskts-domain';
import { NextFunction, Request, Response } from 'express';

export default (req: Request, __: Response, next: NextFunction) => {
    next(new sskts.factory.errors.NotFound(`router for [${req.originalUrl}]`));
};
