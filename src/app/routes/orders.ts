/**
 * 注文ルーター
 */
import * as sskts from '@motionpicture/sskts-domain';
import { Router } from 'express';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import * as moment from 'moment';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

const ordersRouter = Router();
ordersRouter.use(authentication);

/**
 * 確認番号と電話番号で注文照会
 */
ordersRouter.post(
    '/findByOrderInquiryKey',
    permitScopes(['aws.cognito.signin.user.admin', 'orders', 'orders.read-only']),
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
                next(new sskts.factory.errors.Argument('telephone', 'Invalid phone number format'));

                return;
            }

            const key = {
                theaterCode: req.body.theaterCode,
                confirmationNumber: req.body.confirmationNumber,
                telephone: phoneUtil.format(phoneNumber, PhoneNumberFormat.E164)
            };
            const repository = new sskts.repository.Order(sskts.mongoose.connection);
            const order = await repository.findByOrderInquiryKey(key);
            res.json(order);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 注文検索
 */
ordersRouter.get(
    '',
    permitScopes(['admin']),
    (req, __2, next) => {
        req.checkQuery('orderDateFrom').notEmpty().withMessage('required').isISO8601().withMessage('must be ISO8601');
        req.checkQuery('orderDateThrough').notEmpty().withMessage('required').isISO8601().withMessage('must be ISO8601');

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
            const orders = await orderRepo.search({
                sellerId: req.query.sellerId,
                customerMembershipNumber: req.query.customerMembershipNumber,
                orderNumber: req.query.orderNumber,
                orderStatus: req.query.orderStatus,
                orderDateFrom: moment(req.query.orderDateFrom).toDate(),
                orderDateThrough: moment(req.query.orderDateThrough).toDate()
            });
            res.json(orders);
        } catch (error) {
            next(error);
        }
    }
);

export default ordersRouter;
