import { Router } from "express";
let router = Router();
import PerformanceRepository from "../../domain/repository/interpreter/performance";

router.get("/performance/:id", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

        PerformanceRepository.findById(req.params.id).then((performance) => {
            res.json({
                success: true,
                message: "",
                performance: performance
            });
        }).catch((err) => {
            res.json({
                success: false,
                message: err.message
            });
        });
    });
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