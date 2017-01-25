import {Router} from "express";
let router = Router();
import FilmRepository from "../../domain/default/repository/interpreter/film";

router.get("/:id", async (req, res, next) => {
    // req.checkQuery("theater_code", "theater_code required.").notEmpty();
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        // TODO サービス化
        let option = await FilmRepository.findById(req.params.id);
        option.match({
            Some: (film) => {
                res.json({
                    data: {
                        type: "films",
                        _id: film._id,
                        attributes: film
                    }
                });
            },
            None: () => {
                res.status(404);
                res.json({
                    data: null
                });
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;