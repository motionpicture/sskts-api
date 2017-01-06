"use strict";
const TransactionController = require("../controllers/transaction");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (req, res, next) => {
    req.checkParams("id", "invalid transaction id.").notEmpty().isAlphanumeric();
    req.checkBody("password", "invalid transaction password.").notEmpty().isAlphanumeric();
    req.getValidationResult().then((result) => {
        if (!result.isEmpty())
            return next(new Error(result.useFirstErrorOnly().array().pop().msg));
        TransactionController.isAvailable(req.params.id, req.body.password, (err) => {
            if (err) {
                res.json({
                    success: false,
                    message: err.message
                });
            }
            else {
                next();
            }
        });
    });
};
