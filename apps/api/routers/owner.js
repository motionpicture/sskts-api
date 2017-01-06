"use strict";
const express = require("express");
let router = express.Router();
const ownerController = require("../controllers/owner");
router.post("/owner/create", (req, res, next) => {
    req.checkBody("group", "invalid group.").notEmpty();
    req.getValidationResult().then((result) => {
        if (!result.isEmpty())
            return next(new Error(result.array()[0].msg));
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
router.post("/owner/:id/update", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty())
            return next(new Error(result.array()[0].msg));
        let args = {
            _id: req.params.id,
            name: {
                ja: (req.body.name_ja) ? req.body.name_ja : undefined,
                en: (req.body.name_en) ? req.body.name_en : undefined,
            },
            email: (req.body.email) ? req.body.email : undefined,
        };
        ownerController.findByIdAndUpdate(args).then((owner) => {
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
router.get("/owner/:id/assets", (req, res) => {
    req.getValidationResult().then(() => {
        res.json({
            success: false,
            message: "now coding..."
        });
    });
});
router.get("/owner/:id/transactions", (req, res) => {
    req.getValidationResult().then(() => {
        res.json({
            success: false,
            message: "now coding..."
        });
    });
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
