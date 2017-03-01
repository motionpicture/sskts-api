/**
 * filmルーター
 *
 * @ignore
 */
import { Router } from 'express';
const router = Router();

import * as sskts from '@motionpicture/sskts-domain';
import * as HTTPStatus from 'http-status';
import * as mongoose from 'mongoose';

import authentication from '../middlewares/authentication';

router.use(authentication);

router.get('/:id', async (req, res, next) => {
    // req.checkQuery('theater_code', 'theater_code required.').notEmpty();
    const validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }

    try {
        const option = await sskts.service.master.findFilm(req.params.id)(sskts.createFilmRepository(mongoose.connection));
        option.match({
            Some: (film) => {
                res.json({
                    data: {
                        type: 'films',
                        id: film.id,
                        attributes: film
                    }
                });
            },
            None: () => {
                res.status(HTTPStatus.NOT_FOUND);
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
