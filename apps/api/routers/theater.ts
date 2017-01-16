import {Router} from "express";
let router = Router();
import TheaterRepository from "../../domain/repository/interpreter/theater";

router.get("/theater/:code", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

        TheaterRepository.findById(req.params.code).then((optionTheater) => {
            optionTheater.match({
                Some: (theater) => {
                    res.json({
                        success: true,
                        message: "",
                        theater: theater
                    });
                },
                None: () => {
                    res.status(404);
                    res.json({
                        success: true,
                        message: "not found.",
                        theater: null
                    });
                }
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