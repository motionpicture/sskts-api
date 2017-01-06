import {Request, Response, NextFunction} from "express";
import * as TransactionController from "../controllers/transaction";

/**
 * 取引アクセス認証ミドルウェア
 */
export default (req: Request, res: Response, next: NextFunction) => {
    req.checkParams("id", "invalid transaction id.").notEmpty().isAlphanumeric();
    req.checkBody("password", "invalid transaction password.").notEmpty().isAlphanumeric();

    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.useFirstErrorOnly().array().pop().msg));

        // 取引の有効性確認
        TransactionController.isAvailable(req.params.id, req.body.password, (err) => {
            if (err) {
                res.json({
                    success: false,
                    message: err.message
                });
            } else {
                next();
            }
        });
    });
}
