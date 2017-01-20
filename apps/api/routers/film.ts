import {Router} from "express";
let router = Router();
import FilmRepository from "../../domain/repository/interpreter/film";

router.get("/film/:id", async (req, res, next) => {
    // req.checkQuery("theater_code", "theater_code required.").notEmpty();
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let option = await FilmRepository.findById(req.params.id);
        option.match({
            Some: (film) => {
                res.json({
                    message: "",
                    film: film
                });
            },
            None: () => {
                res.status(404);
                res.json({
                    message: "not found.",
                    film: null
                });
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;