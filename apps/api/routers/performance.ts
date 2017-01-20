import { Router } from "express";
let router = Router();
import PerformanceRepository from "../../domain/repository/interpreter/performance";
import PerformanceService from "../../domain/service/interpreter/performance";

router.get("/:id", async (req, res, next) => {
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let option = await PerformanceRepository.findById(req.params.id);
        option.match({
            Some: (performance) => {
                res.json({
                    data: {
                        type: "performances",
                        _id: performance._id,
                        attributes: performance
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

router.get("", async (req, res, next) => {
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let performances = await PerformanceService.search({
            day: req.query.day,
            theater: req.query.theater,
        })(PerformanceRepository);

        let data = performances.map((performance) => {
            return {
                type: "performances",
                _id: performance._id,
                attributes: performance
            }
        });

        res.json({
            data: data,
        });
    } catch (error) {
        next(error);
    }
});

export default router;