import {Router} from "express";
let router = Router();
import ScreenRepository from "../../domain/repository/interpreter/screen";

router.get("/screen/:id", async (req, res, next) => {
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let option = await ScreenRepository.findById(req.params.id);
        option.match({
            Some: (screen) => {
                res.json({
                    success: true,
                    message: "",
                    screen: screen
                });
            },
            None: () => {
                res.status(404);
                res.json({
                    success: true,
                    message: "not found.",
                    screen: null
                });
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;