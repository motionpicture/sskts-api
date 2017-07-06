/**
 * filmルーター
 *
 * @ignore
 */

import { Router } from 'express';
const filmRouter = Router();

import * as sskts from '@motionpicture/sskts-domain';
import { NOT_FOUND } from 'http-status';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

filmRouter.use(authentication);

filmRouter.get(
    '/:id',
    permitScopes(['admin', 'films', 'films.read-only']),
    (_1, _2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const option = await sskts.service.master.findFilm(req.params.id)(sskts.adapter.film(sskts.mongoose.connection));
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
                    res.status(NOT_FOUND);
                    res.json({
                        data: null
                    });
                }
            });
        } catch (error) {
            next(error);
        }
    });

export default filmRouter;
