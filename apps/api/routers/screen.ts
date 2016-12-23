import {Router} from "express";
let router = Router();

import * as screenController from "../controllers/screen";
router.get("/screen/:id", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.useFirstErrorOnly().array().pop().msg));

        screenController.findById(req.params.id).then((screen) => {
            res.json({
                success: true,
                screen: screen
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