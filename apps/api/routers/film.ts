import {Router} from "express";
let router = Router();
import FilmRepository from "../../domain/repository/interpreter/film";

router.get("/film/:id", (req, res, next) => {
    // req.checkQuery("theater_code", "theater_code required.").notEmpty();
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

        FilmRepository.findById(req.params.id).then((film) => {
            res.json({
                success: true,
                message: "",
                film: film
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