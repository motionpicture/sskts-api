import {Router} from "express";
let router = Router();
import ScreenRepository from "../../domain/repository/interpreter/screen";

router.get("/screen/:id", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

        ScreenRepository.findById(req.params.id).then((screen) => {
            res.json({
                success: true,
                message: "",
                screen: screen
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