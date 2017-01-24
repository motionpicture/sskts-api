import express = require("express");
let router = express.Router();
import OwnerRepository from "../../domain/default/repository/interpreter/owner";
import TransactionService from "../../domain/default/service/interpreter/transaction";

router.post("/anonymous", async (req, res, next) => {
    // req.checkBody("group", "invalid group.").notEmpty();

    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let owner = await TransactionService.createAnonymousOwner()(OwnerRepository);

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
        })(OwnerRepository);

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async (req, res, next) => {
    // TODO validation

    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let option = await OwnerRepository.findById(req.params.id);
        option.match({
            Some: (owner) => {
                res.json({
                    data: {
                        type: "owners",
                        _id: owner._id,
                        attributes: owner
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

// router.post("/owner/:id/update", (req, res, next) => {
//     req.getValidationResult().then((result) => {
//         if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

//         let args = {
//             _id: req.params.id,
//             name: {
//                 ja: (req.body.name_ja) ? req.body.name_ja : undefined,
//                 en: (req.body.name_en) ? req.body.name_en : undefined,
//             },
//             email: (req.body.email) ? req.body.email : undefined,
//         };
//         OwnerRepository.findByIdAndUpdate(args).then((owner) => {
//             res.json({
//                 message: null,
//                 owner: owner
//             });
//         }, (err) => {
//             res.json({
//                 message: err.message
//             });
//         });
//     });
// });

// router.get("/owner/:id/assets", (req, res) => {
//     req.getValidationResult().then(() => {
//         res.json({
//             message: "now coding..."
//         });
//     });
// });

// router.get("/owner/:id/transactions", (req, res) => {
//     req.getValidationResult().then(() => {
//         res.json({
//             message: "now coding..."
//         });
//     });
// });

export default router;