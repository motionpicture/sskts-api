import {Router} from "express";
let router = Router();
import * as filmController from "../controllers/film";

router.get("/film/:id", (req, res, next) => {
    // req.checkQuery("theater_code", "theater_code required.").notEmpty();
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.useFirstErrorOnly().array().pop().msg));

        filmController.findById(req.params.id).then((film) => {
            res.json({
                success: true,
                film: film
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