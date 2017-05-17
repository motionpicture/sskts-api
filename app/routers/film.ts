/**
 * filmルーター
 *
 * @ignore
 */
import { Router } from 'express';
const filmRouter = Router();

import * as sskts from '@motionpicture/sskts-domain';
import { NOT_FOUND } from 'http-status';
import * as mongoose from 'mongoose';

import authentication from '../middlewares/authentication';
import validator from '../middlewares/validator';

filmRouter.use(authentication);

filmRouter.get(
    '/:id',
    (_1, _2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const option = await sskts.service.master.findFilm(req.params.id)(sskts.adapter.film(mongoose.connection));
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
