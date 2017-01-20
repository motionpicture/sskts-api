import express = require("express");
let router = express.Router();

import OwnerRepository from "../../domain/repository/interpreter/owner";
import TransactionRepository from "../../domain/repository/interpreter/transaction";
import TransactionService from "../../domain/service/interpreter/transaction";

// router.get("", (req, res, next) => {
//     req.getValidationResult().then((result) => {
//         if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

//         TransactionRepository.find({}).then((transactions) => {
//             res.json({
//                 message: null,
//                 transactions: transactions
//             });
//         }, (err) => {
//             res.json({
//                 message: err.message
//             });
//         });
//     });
// });

router.get("/:id", async (req, res, next) => {
    // TODO validation

    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let option = await TransactionRepository.findById(req.params.id);
        option.match({
            Some: (transaction) => {
                res.json({
                    data: {
                        type: "transactions",
                        _id: transaction._id,
                        attributes: transaction
                    }
                });
            },
            None: () => {
                res.status(404);
                res.json({
                    data: null
                });
            }
        });
    } catch (error) {
        next(error);
    }
});

router.post("", async (req, res, next) => {
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    // TODO ownersの型チェック

    try {
        let ownerIds: Array<string> = req.body.owners;
        // let ownerIds = ["5868e16789cc75249cdbfa4b", "5869c2c316aaa805d835f94a"];
        let transaction = await TransactionService.start({
            expired_at: new Date(),
            owner_ids: ownerIds
        })(OwnerRepository, TransactionRepository);

        res.status(201);
        res.setHeader("Location", `https://${req.headers["host"]}/transactions/${transaction._id}`);
        res.json({
            data: {
                type: "transactions",
                _id: transaction._id,
            }
        });
    } catch (error) {
        next(error);
    }
});

router.post("/:id/authorizations/gmo", async (req, res, next) => {
    // TODO validations
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        await TransactionService.addGMOAuthorization({
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

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.delete("/:id/authorizations/gmo", async (req, res, next) => {
    // TODO validations
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        await TransactionService.removeGMOAuthorization({
            transaction_id: req.params.id,
            gmo_order_id: req.body.gmo_order_id,
        })(TransactionRepository);

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.post("/:id/authorizations/coaSeatReservation", async (req, res, next) => {
    // TODO validations
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        await TransactionService.addCOASeatReservationAuthorization({
            transaction_id: req.params.id,
            owner_id: req.body.owner_id,
            coa_tmp_reserve_num: req.body.coa_tmp_reserve_num,
            seats: req.body.seats,
        })(TransactionRepository);

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.delete("/:id/authorizations/coaSeatReservation", async (req, res, next) => {
    // TODO validations
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        await TransactionService.removeCOASeatReservationAuthorization({
            transaction_id: req.params.id,
            coa_tmp_reserve_num: req.body.coa_tmp_reserve_num,
        })(TransactionRepository);

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.patch("/:id/enableInquiry", async (req, res, next) => {
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        await TransactionService.enableInquiry({
            transaction_id: req.params.id,
            inquiry_id: req.body.inquiry_id,
            inquiry_pass: req.body.inquiry_pass,
        })(TransactionRepository);

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.patch("/:id/close", async (req, res, next) => {
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        await TransactionService.close({
            transaction_id: req.params.id
        })(TransactionRepository);

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;