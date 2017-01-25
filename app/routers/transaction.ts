import express = require("express");
let router = express.Router();

import OwnerRepository from "../../domain/default/repository/interpreter/owner";
import TransactionRepository from "../../domain/default/repository/interpreter/transaction";
import TransactionService from "../../domain/default/service/interpreter/transaction";

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
        let option = await TransactionService.getDetails({
            transaction_id: req.params.id
        })(TransactionRepository);
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
            expired_at: new Date(), // TODO 受け取る
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

        res.status(200).json({
            data: {
                type: "authorizations",
                _id: authorization._id
            }
        });
    } catch (error) {
        next(error);
    }
});

router.post("/:id/authorizations/coaSeatReservation", async (req, res, next) => {
    // TODO validations
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let authorization = await TransactionService.addCOASeatReservationAuthorization({
            transaction_id: req.params.id,
            owner_id: req.body.owner_id,
            coa_tmp_reserve_num: req.body.coa_tmp_reserve_num,
            seats: req.body.seats,
        })(TransactionRepository);

        res.status(200).json({
            data: {
                type: "authorizations",
                _id: authorization._id
            }
        });
    } catch (error) {
        next(error);
    }
});

router.delete("/:id/authorizations/:authorization_id", async (req, res, next) => {
    // TODO validations
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        await TransactionService.removeAuthorization({
            transaction_id: req.params.id,
            authorization_id: req.params.authorization_id,
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

router.post("/:id/emails", async (req, res, next) => {
    // TODO validations
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let email = await TransactionService.addEmail({
            transaction_id: req.params.id,
            from: req.body.from,
            to: req.body.to,
            subject: req.body.subject,
            body: req.body.body,
        })(TransactionRepository);

        res.status(200).json({
            data: {
                type: "emails",
                _id: email._id
            }
        });
    } catch (error) {
        next(error);
    }
});

router.delete("/:id/emails/:email_id", async (req, res, next) => {
    // TODO validations
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        await TransactionService.removeEmail({
            transaction_id: req.params.id,
            email_id: req.params.email_id,
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