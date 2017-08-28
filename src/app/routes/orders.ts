/**
 * orders router
 * @module ordersRouter
 */

import * as sskts from '@motionpicture/sskts-domain';
import { Router } from 'express';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import * as httpStatus from 'http-status';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

const ordersRouter = Router();
ordersRouter.use(authentication);

/**
 * make inquiry of an order
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
            const phoneUtil = PhoneNumberUtil.getInstance();
            const phoneNumber = phoneUtil.parse(req.body.telephone, 'JP');
            if (!phoneUtil.isValidNumber(phoneNumber)) {
                next(new Error('invalid phone number format'));

                return;
            }

            const key = {
                theaterCode: req.body.theaterCode,
                confirmationNumber: req.body.confirmationNumber,
                telephone: phoneUtil.format(phoneNumber, PhoneNumberFormat.E164)
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
                            res.status(httpStatus.NOT_FOUND);
                            next(new Error('order not found'));
                        }
                    });
                });
        } catch (error) {
            next(error);
        }
    }
);

export default ordersRouter;
