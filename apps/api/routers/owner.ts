import express = require("express");
let router = express.Router();
import AnonymousOwnerRepository from "../../domain/repository/interpreter/owner/anonymous";
import OwnerService from "../../domain/service/interpreter/owner";

router.all("/owner/anonymous/create", async (req, res, next) => {
    // req.checkBody("group", "invalid group.").notEmpty();

    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let owner = await OwnerService.createAnonymous()(AnonymousOwnerRepository);

        res.json({
            owner: owner
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