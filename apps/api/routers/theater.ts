import {Router} from "express";
let router = Router();
import TheaterRepository from "../../domain/repository/interpreter/theater";

router.get("/theater/:code", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

        TheaterRepository.findById(req.params.code).then((theater) => {
            res.json({
                success: true,
                message: "",
                theater: theater
            });
        }).catch((err) => {
            res.json({
                success: false,
                message: err.message
            });
        });
    });
});

export default router;