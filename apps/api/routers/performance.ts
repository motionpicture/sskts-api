import { Router } from "express";
let router = Router();
import PerformanceRepository from "../../domain/repository/interpreter/performance";

router.get("/performance/:id", async (req, res, next) => {
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let option = await PerformanceRepository.findById(req.params.id);
        option.match({
            Some: (performance) => {
                res.json({
                    success: true,
                    message: "",
                    performance: performance
                });
            },
            None: () => {
                res.status(404);
                res.json({
                    success: true,
                    message: "not found.",
                    performance: null
                });
            }
        });
    } catch (error) {
        next(error);
    }
});

// router.get("/performances", (req, res, next) => {
//     req.getValidationResult().then((result) => {
//         if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

//         PerformanceRepository.find({
//             day: req.query.day,
//             theater: req.query.theater,
//         }).then((performances) => {
//             res.json({
//                 success: true,
//                 performances: performances
//             });
//         }, (err) => {
//             res.json({
//                 success: false,
//                 message: err.message
//             });
//         });
//     });
// });

export default router;