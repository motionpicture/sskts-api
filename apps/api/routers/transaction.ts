import mongoose = require("mongoose");
import express = require("express");
let router = express.Router();

import authentication4transaction from "../middlewares/authentication4transaction";
import OwnerRepository from "../../domain/repository/interpreter/owner";
import TransactionRepository from "../../domain/repository/interpreter/transaction";
import TransactionService from "../../domain/service/interpreter/transaction";
import * as Authorization from "../../domain/model/Authorization";

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
    let transaction = await TransactionService.start(new Date(), ownerIds)(OwnerRepository, TransactionRepository);
    res.json({
        success: true,
        message: null,
        transaction: transaction
    });
});

router.post("/transaction/:id/addGMOAuthorization", authentication4transaction, async (req, res, next) => {
    // TODO validations
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let authorization = new Authorization.GMO(
            mongoose.Types.ObjectId().toString(),
            "gmo_test_order_id"
        );
        await TransactionService.addGMOAuthorization(req.params.id, authorization)(TransactionRepository);
        res.json({
            success: true,
            message: null,
        });
    } catch (error) {
        next(error);
    }
});

router.post("/transaction/:id/close", authentication4transaction, async (req, res, next) => {
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    await TransactionService.close(req.params.id)(TransactionRepository);
    res.json({
        success: true,
        message: null,
    });
});

// router.post("/transaction/:id/unauthorize", authentication4transaction, async (req, res, next) => {
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