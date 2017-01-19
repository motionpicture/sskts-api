import express = require("express");
let router = express.Router();

import OwnerRepository from "../../domain/repository/interpreter/owner";
import TransactionRepository from "../../domain/repository/interpreter/transaction";
import TransactionService from "../../domain/service/interpreter/transaction";

// router.get("/transactions", (req, res, next) => {
//     req.getValidationResult().then((result) => {
//         if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

//         TransactionRepository.find({}).then((transactions) => {
//             res.json({
//                 success: true,
//                 message: null,
//                 transactions: transactions
//             });
//         }, (err) => {
//             res.json({
//                 success: false,
//                 message: err.message
//             });
//         });
//     });
// });

router.post("/transaction/start", async (req, res, next) => {
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    // TODO ownersの型チェック

    let ownerIds: Array<string> = req.body.owners;
    // let owners = ["5868e16789cc75249cdbfa4b", "5869c2c316aaa805d835f94a"];
    let transaction = await TransactionService.start({
        expired_at: new Date(),
        owner_ids: ownerIds
    })(OwnerRepository, TransactionRepository);
    res.json({
        success: true,
        message: null,
        transaction: transaction
    });
});

router.post("/transaction/:id/addGMOAuthorization", async (req, res, next) => {
    // TODO validations
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let authorization = await TransactionService.addGMOAuthorization({
            transaction_id: req.params.id,
            owner_id: req.body.owner_id,
            gmo_shop_id: req.body.gmo_shop_id,
            gmo_shop_pass: req.body.gmo_shop_pass,
            gmo_order_id: req.body.gmo_order_id,
            gmo_amount: req.body.gmo_amount,
            gmo_access_id: req.body.gmo_access_id,
            gmo_access_pass: req.body.gmo_access_pass,
            gmo_job_cd: req.body.gmo_job_cd,
            gmo_pay_type: req.body.gmo_pay_type,
        })(TransactionRepository);

        res.json({
            success: true,
            message: null,
            authorization: authorization
        });
    } catch (error) {
        next(error);
    }
});

router.post("/transaction/:id/addCOAAuthorization", async (req, res, next) => {
    // TODO validations
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let authorization = await TransactionService.addCOAAuthorization({
            transaction_id: req.params.id,
            owner_id: req.body.owner_id,
            coa_tmp_reserve_num: req.body.coa_tmp_reserve_num,
            seats: req.body.seats,
        })(TransactionRepository);

        res.json({
            success: true,
            message: null,
            authorization: authorization
        });
    } catch (error) {
        next(error);
    }
});

router.post("/transaction/:id/removeAuthorization", async (req, res, next) => {
    // TODO validations
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        await TransactionService.removeAuthorization({
            transaction_id: req.params.id,
            authorization_id: req.body.authorization_id
        })(TransactionRepository);

        res.json({
            success: true,
            message: null,
        });
    } catch (error) {
        next(error);
    }
});

router.post("/transaction/:id/enableInquiry", async (req, res, next) => {
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        await TransactionService.enableInquiry({
            transaction_id: req.params.id,
            inquiry_id: req.body.inquiry_id,
            inquiry_pass: req.body.inquiry_pass,
        })(TransactionRepository);

        res.json({
            success: true,
            message: null,
        });
    } catch (error) {
        next(error);
    }
});

router.post("/transaction/:id/close", async (req, res, next) => {
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        await TransactionService.close({
            transaction_id: req.params.id
        })(TransactionRepository);

        res.json({
            success: true,
            message: null,
        });
    } catch (error) {
        next(error);
    }
});

// router.post("/transaction/:id/unauthorize", async (req, res, next) => {
//     // TODO validations
//     let validatorResult = await req.getValidationResult();
//     if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

//     req.getValidationResult().then((result) => {
//         if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

//         AuthorizationRepository.remove({
//             transaction: req.params.id,
//             authorizations: req.body.authorizations,
//         }).then((results) => {
//             res.json({
//                 success: true,
//                 message: null,
//                 results: results
//             });
//         }, (err) => {
//             res.json({
//                 success: false,
//                 message: err.message
//             });
//         });
//     });
// });

// router.post("/transaction/:id/update", async (req, res, next) => {
//     req.getValidationResult().then((result) => {
//         if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

//         let args = {
//             _id: req.params.id,
//             expired_at: (req.body.expired_at) ? new Date(parseInt(req.body.expired_at) * 1000) : undefined,
//             access_id: (req.body.access_id) ? req.body.access_id : undefined,
//             access_pass: (req.body.access_pass) ? req.body.access_pass : undefined,
//         };
//         TransactionRepository.update(args).then(() => {
//             res.json({
//                 success: true,
//                 message: null,
//             });
//         }, (err) => {
//             res.json({
//                 success: false,
//                 message: err.message
//             });
//         });
//     });
// });

export default router;