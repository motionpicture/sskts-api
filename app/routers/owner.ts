import express = require("express");
let router = express.Router();
import OwnerRepository from "../../domain/default/repository/interpreter/owner";
import TransactionService from "../../domain/default/service/interpreter/transaction";
import mongoose = require("mongoose");

router.post("/anonymous", async (req, res, next) => {
    // req.checkBody("group", "invalid group.").notEmpty();

    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let owner = await TransactionService.createAnonymousOwner()(OwnerRepository(mongoose.connection));

        res.status(201);
        res.setHeader("Location", `https://${req.headers["host"]}/owners/${owner._id}`);
        res.json({
            data: {
                type: "owners",
                _id: owner._id,
            }
        });
    } catch (error) {
        next(error);
    }
});

router.patch("/anonymous/:id", async (req, res, next) => {
    // req.checkBody("group", "invalid group.").notEmpty();

    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        await TransactionService.updateAnonymousOwner({
            _id: req.params.id,
            name_first: req.body.name_first,
            name_last: req.body.name_last,
            tel: req.body.tel,
            email: req.body.email,
        })(OwnerRepository(mongoose.connection));

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.get("/administrator", async (req, res, next) => {
    // TODO validation

    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let owner = await TransactionService.getAdministratorOwner()(OwnerRepository(mongoose.connection));
        res.json({
            data: {
                type: "owners",
                _id: owner._id,
                attributes: owner
            }
        });
    } catch (error) {
        next(error);
    }
});

// router.get("/owner/:id/transactions", (req, res) => {
//     req.getValidationResult().then(() => {
//         res.json({
//             message: "now coding..."
//         });
//     });
// });

export default router;