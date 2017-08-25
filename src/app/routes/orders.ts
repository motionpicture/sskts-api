/**
 * 注文ルーター
 *
 * @module ordersRouter
 */

import { Router } from 'express';
const ordersRouter = Router();

import * as sskts from '@motionpicture/sskts-domain';
import * as httpStatus from 'http-status';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

ordersRouter.use(authentication);

/**
 * 注文照会
 */
ordersRouter.post(
    '/findByOrderInquiryKey',
    permitScopes(['orders', 'orders.read-only']),
    (req, _, next) => {
        req.checkBody('theaterCode', 'invalid theaterCode').notEmpty().withMessage('theaterCode is required');
        req.checkBody('confirmationNumber', 'invalid confirmationNumber').notEmpty().withMessage('confirmationNumber is required');
        req.checkBody('telephone', 'invalid telephone').notEmpty().withMessage('telephone is required');

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const key = {
                theaterCode: req.body.theaterCode,
                confirmationNumber: req.body.confirmationNumber,
                telephone: req.body.telephone
            };

            await sskts.service.order.findByOrderInquiryKey(key)(sskts.adapter.order(sskts.mongoose.connection))
                .then((option) => {
                    option.match({
                        Some: (order) => {
                            res.json({
                                data: order
                            });
                        },
                        None: () => {
                            res.status(httpStatus.NOT_FOUND).json({
                                data: null
                            });
                        }
                    });
                });
        } catch (error) {
            next(error);
        }
    }
);

export default ordersRouter;
