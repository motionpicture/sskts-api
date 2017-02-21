import { Router } from 'express';
let router = Router();
import * as SSKTS from '@motionpicture/sskts-domain';
import mongoose = require('mongoose');

router.get('/:id', async (req, res, next) => {
    // req.checkQuery('theater_code', 'theater_code required.').notEmpty();
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let option = await SSKTS.MasterService.findFilm(req.params.id)(SSKTS.createFilmRepository(mongoose.connection));
        option.match({
            Some: (film) => {
                res.json({
                    data: {
                        type: 'films',
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
