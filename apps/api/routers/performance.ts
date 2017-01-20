import { Router } from "express";
let router = Router();
import PerformanceRepository from "../../domain/repository/interpreter/performance";
import PerformanceService from "../../domain/service/interpreter/performance";

router.get("/performance/:id", async (req, res, next) => {
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let option = await PerformanceRepository.findById(req.params.id);
        option.match({
            Some: (performance) => {
                res.json({
                    message: "",
                    performance: performance
                });
            },
            None: () => {
                res.status(404);
                res.json({
                    message: "not found.",
                    performance: null
                });
            }
        });
    } catch (error) {
        next(error);
    }
});

router.get("/performances", async (req, res, next) => {
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let performances = await PerformanceService.search({
            day: req.query.day,
            theater: req.query.theater,
        })(PerformanceRepository);

        res.json({
            message: "",
            performances: performances
        });
    } catch (error) {
        next(error);
    }
});

export default router;