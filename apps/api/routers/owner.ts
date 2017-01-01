import express = require("express")
let router = express.Router();

import * as ownerController from "../controllers/owner";
router.post("/owner/create", (req, res, next) => {
    req.getValidationResult().then((result) => {
        req.checkBody("group", "invalid group.").notEmpty();

        if (!result.isEmpty()) return next(new Error(result.useFirstErrorOnly().array().pop().msg));

        ownerController.create(req.body.group).then((owner) => {
            res.json({
                success: true,
                message: null,
                owner: owner
            });
        }, (err) => {
            res.json({
                success: false,
                message: err.message
            });
        });
    });
});

export default router;