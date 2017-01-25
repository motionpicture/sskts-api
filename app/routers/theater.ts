import {Router} from "express";
let router = Router();
import TheaterRepository from "../../domain/default/repository/interpreter/theater";
import MasterService from "../../domain/default/service/interpreter/master";

router.get("/:code", async (req, res, next) => {
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let option = await MasterService.findTheater({
            theater_id: req.params.id
        })(TheaterRepository);
        option.match({
            Some: (theater) => {
                res.json({
                    data: {
                        type: "theaters",
                        _id: theater._id,
                        attributes: theater
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