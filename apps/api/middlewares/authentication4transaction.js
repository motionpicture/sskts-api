"use strict";
const transactionController = require("../controllers/transaction");
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 取引アクセス認証ミドルウェア
 */
exports.default = (req, res, next) => {
    req.checkParams("id", "invalid transaction id.").notEmpty().isAlphanumeric();
    req.checkBody("password", "invalid transaction password.").notEmpty().isAlphanumeric();
    req.getValidationResult().then((result) => {
        if (!result.isEmpty())
            return next(new Error(result.useFirstErrorOnly().array().pop().msg));
        // 取引の有効性確認
        transactionController.isAvailable(req.params.id, req.body.password, (err, isAvailable) => {
            if (!isAvailable)
                return next(err);
            next();
        });
    });
};
