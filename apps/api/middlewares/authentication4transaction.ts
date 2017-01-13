import {Request, Response, NextFunction} from "express";
// import * as TransactionRepository from "../../common/infrastructure/persistence/mongoose/repositories/transaction";

/**
 * 取引アクセス認証ミドルウェア
 */
export default (req: Request, res: Response, next: NextFunction) => {
    console.log(req);
    console.log(res);
    next();
    // req.checkParams("id", "invalid transaction id.").notEmpty().isAlphanumeric();
    // req.checkBody("password", "invalid transaction password.").notEmpty().isAlphanumeric();

    // req.getValidationResult().then((result) => {
    //     if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

    //     // 取引の有効性確認
    //     TransactionRepository.default.isAvailable(req.params.id, req.body.password).then(() => {
    //         next();
    //     }, (err) => {
    //         res.json({
    //             success: false,
    //             message: err.message
    //         });

    //         return;
    //     });
    // });
}
