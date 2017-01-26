import {Router} from "express";
let router = Router();
import FilmRepository from "../../domain/default/repository/interpreter/film";
import MasterService from "../../domain/default/service/interpreter/master";
import mongoose = require("mongoose");

router.get("/:id", async (req, res, next) => {
    // req.checkQuery("theater_code", "theater_code required.").notEmpty();
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let option = await MasterService.findFilm({
            film_id: req.params.id
        })(FilmRepository(mongoose.connection));
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