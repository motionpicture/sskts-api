import {Router} from "express";
let router = Router();
import TheaterRepository from "../../domain/repository/interpreter/theater";

router.get("/theater/:code", async (req, res, next) => {
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let optionTheater = await TheaterRepository.findById(req.params.code);
        optionTheater.match({
            Some: (theater) => {
                res.json({
                    message: "",
                    theater: theater
                });
            },
            None: () => {
                res.status(404);
                res.json({
                    message: "not found.",
                    theater: null
                });
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;