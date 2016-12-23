"use strict";
const transactionController = require("../controllers/transaction");
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 取引アクセス認証ミドルウェア
 */
exports.default = (req, res, next) => {
    req.checkBody("transaction_id").notEmpty().isAlphanumeric();
    req.checkBody("transaction_password").notEmpty().isAlphanumeric();
    req.getValidationResult().then((result) => {
        if (!result.isEmpty())
            return next(new Error(result.useFirstErrorOnly().array().pop().msg));
        // 取引の有効性確認
        transactionController.isValid(req.body.transaction_id, req.body.transaction_password, (err, isValid) => {
            if (!isValid)
                return next(err);
            next();
        });
    });
};
