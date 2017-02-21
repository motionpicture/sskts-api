import { Router } from 'express';
let router = Router();
import * as SSKTS from '@motionpicture/sskts-domain';
import mongoose = require('mongoose');

router.get('/:id', async (req, res, next) => {
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let option = await SSKTS.MasterService.findScreen(req.params.id)(SSKTS.createScreenRepository(mongoose.connection));
        option.match({
            Some: (screen) => {
                res.json({
                    data: {
                        type: 'screens',
                        _id: screen._id,
                        attributes: screen
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
