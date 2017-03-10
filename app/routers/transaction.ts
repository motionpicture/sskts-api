/**
 * transactionルーター
 *
 * @ignore
 */
import * as express from 'express';
const router = express.Router();

import * as sskts from '@motionpicture/sskts-domain';
import * as HTTPStatus from 'http-status';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import authentication from '../middlewares/authentication';

router.use(authentication);

router.post('/makeInquiry', async (req, res, next) => {
    req.checkBody('inquiry_theater', 'invalid inquiry_theater').notEmpty().withMessage('inquiry_theater is required');
    req.checkBody('inquiry_id', 'invalid inquiry_id').notEmpty().withMessage('inquiry_id is required');
    req.checkBody('inquiry_pass', 'invalid inquiry_pass').notEmpty().withMessage('inquiry_pass is required');

    const validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }

    try {
        const key = sskts.factory.transactionInquiryKey.create({
            theater_code: req.body.inquiry_theater,
            reserve_num: req.body.inquiry_id,
            tel: req.body.inquiry_pass
        });
        const option = await sskts.service.transaction.makeInquiry(key)(sskts.createTransactionAdapter(mongoose.connection));

        option.match({
            Some: (transaction) => {
                res.json({
                    data: {
                        type: 'transactions',
                        id: transaction.id,
                        attributes: transaction
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

router.get('/:id', async (req, res, next) => {
    // todo validation

    const validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }

    try {
        const option = await sskts.service.transaction.findById(req.params.id)(sskts.createTransactionAdapter(mongoose.connection));
        option.match({
            Some: (transaction) => {
                res.json({
                    data: {
                        type: 'transactions',
                        id: transaction.id,
                        attributes: transaction
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

router.post('', async (req, res, next) => {
    // expired_atはsecondsのUNIXタイムスタンプで
    req.checkBody('expired_at', 'invalid expired_at').notEmpty().withMessage('expired_at is required').isInt();

    const validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }

    try {
        // tslint:disable-next-line:no-magic-numbers
        const transaction = await sskts.service.transaction.start(moment.unix(parseInt(req.body.expired_at, 10)).toDate())(
            sskts.createOwnerAdapter(mongoose.connection),
            sskts.createTransactionAdapter(mongoose.connection)
        );

        // tslint:disable-next-line:no-string-literal
        const hots = req.headers['host'];
        res.status(HTTPStatus.CREATED);
        res.setHeader('Location', `https://${hots}/transactions/${transaction.id}`);
        res.json({
            data: {
                type: 'transactions',
                id: transaction.id,
                attributes: transaction
            }
        });
    } catch (error) {
        next(error);
    }
});

router.patch('/:id/anonymousOwner', async (req, res, next) => {
    req.checkBody('name_first', 'invalid name_first').optional().notEmpty().withMessage('name_first should not be empty');
    req.checkBody('name_last', 'invalid name_last').optional().notEmpty().withMessage('name_last should not be empty');
    req.checkBody('tel', 'invalid tel').optional().notEmpty().withMessage('tel should not be empty');
    req.checkBody('email', 'invalid email').optional().notEmpty().withMessage('email should not be empty');

    const validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }

    try {
        await sskts.service.transaction.updateAnonymousOwner({
            transaction_id: req.params.id,
            name_first: req.body.name_first,
            name_last: req.body.name_last,
            tel: req.body.tel,
            email: req.body.email
        })(sskts.createOwnerAdapter(mongoose.connection), sskts.createTransactionAdapter(mongoose.connection));

        res.status(HTTPStatus.NO_CONTENT).end();
    } catch (error) {
        next(error);
    }
});

router.post('/:id/authorizations/gmo', async (req, res, next) => {
    req.checkBody('owner_id_from', 'invalid owner_id_from').notEmpty().withMessage('owner_id_from is required');
    req.checkBody('owner_id_to', 'invalid owner_id_to').notEmpty().withMessage('owner_id_to is required');
    req.checkBody('gmo_shop_id', 'invalid gmo_shop_id').notEmpty().withMessage('gmo_shop_id is required');
    req.checkBody('gmo_shop_pass', 'invalid gmo_shop_pass').notEmpty().withMessage('gmo_shop_pass is required');
    req.checkBody('gmo_order_id', 'invalid gmo_order_id').notEmpty().withMessage('gmo_order_id is required');
    req.checkBody('gmo_amount', 'invalid gmo_amount').notEmpty().withMessage('gmo_amount is required');
    req.checkBody('gmo_access_id', 'invalid gmo_access_id').notEmpty().withMessage('gmo_access_id is required');
    req.checkBody('gmo_access_pass', 'invalid gmo_access_pass').notEmpty().withMessage('gmo_access_pass is required');
    req.checkBody('gmo_job_cd', 'invalid gmo_job_cd').notEmpty().withMessage('gmo_job_cd is required');
    req.checkBody('gmo_pay_type', 'invalid gmo_pay_type').notEmpty().withMessage('gmo_pay_type is required');

    const validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }

    try {
        const authorization = sskts.factory.authorization.createGMO({
            owner_from: req.body.owner_id_from,
            owner_to: req.body.owner_id_to,
            gmo_shop_id: req.body.gmo_shop_id,
            gmo_shop_pass: req.body.gmo_shop_pass,
            gmo_order_id: req.body.gmo_order_id,
            gmo_amount: req.body.gmo_amount,
            gmo_access_id: req.body.gmo_access_id,
            gmo_access_pass: req.body.gmo_access_pass,
            gmo_job_cd: req.body.gmo_job_cd,
            gmo_pay_type: req.body.gmo_pay_type,
            price: req.body.gmo_amount
        });
        await sskts.service.transaction.addGMOAuthorization(req.params.id, authorization)(
            sskts.createTransactionAdapter(mongoose.connection)
        );

        res.status(HTTPStatus.OK).json({
            data: {
                type: 'authorizations',
                id: authorization.id
            }
        });
    } catch (error) {
        next(error);
    }
});

router.post('/:id/authorizations/coaSeatReservation', async (req, res, next) => {
    req.checkBody('owner_id_from', 'invalid owner_id_from').notEmpty().withMessage('owner_id_from is required');
    req.checkBody('owner_id_to', 'invalid owner_id_to').notEmpty().withMessage('owner_id_to is required');
    req.checkBody('coa_tmp_reserve_num', 'invalid coa_tmp_reserve_num').notEmpty().withMessage('coa_tmp_reserve_num is required');
    req.checkBody('coa_theater_code', 'invalid coa_theater_code').notEmpty().withMessage('coa_theater_code is required');
    req.checkBody('coa_date_jouei', 'invalid coa_date_jouei').notEmpty().withMessage('coa_date_jouei is required');
    req.checkBody('coa_title_code', 'invalid coa_title_code').notEmpty().withMessage('coa_title_code is required');
    req.checkBody('coa_title_branch_num', 'invalid coa_title_branch_num').notEmpty().withMessage('coa_title_branch_num is required');
    req.checkBody('coa_time_begin', 'invalid coa_time_begin').notEmpty().withMessage('coa_time_begin is required');
    req.checkBody('coa_screen_code', 'invalid coa_screen_code').notEmpty().withMessage('coa_screen_code is required');
    req.checkBody('seats', 'invalid seats').notEmpty().withMessage('seats is required');
    req.checkBody('price', 'invalid price').notEmpty().withMessage('price is required').isInt();

    const validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }

    try {
        const authorization = sskts.factory.authorization.createCOASeatReservation({
            owner_from: req.body.owner_id_from,
            owner_to: req.body.owner_id_to,
            // tslint:disable-next-line:no-magic-numbers
            coa_tmp_reserve_num: parseInt(req.body.coa_tmp_reserve_num, 10),
            coa_theater_code: req.body.coa_theater_code,
            coa_date_jouei: req.body.coa_date_jouei,
            coa_title_code: req.body.coa_title_code,
            coa_title_branch_num: req.body.coa_title_branch_num,
            coa_time_begin: req.body.coa_time_begin,
            coa_screen_code: req.body.coa_screen_code,
            assets: req.body.seats.map((seat: any) => {
                return sskts.factory.asset.createSeatReservation({
                    ownership: sskts.factory.ownership.create({
                        owner: req.body.owner_id_to,
                        authenticated: false
                    }),
                    authorizations: [],
                    performance: seat.performance,
                    section: seat.section,
                    seat_code: seat.seat_code,
                    ticket_code: seat.ticket_code,
                    ticket_name_ja: seat.ticket_name_ja,
                    ticket_name_en: seat.ticket_name_en,
                    ticket_name_kana: seat.ticket_name_kana,
                    std_price: seat.std_price,
                    add_price: seat.add_price,
                    dis_price: seat.dis_price,
                    sale_price: seat.sale_price
                });
            }),
            // tslint:disable-next-line:no-magic-numbers
            price: parseInt(req.body.price, 10)
        });
        await sskts.service.transaction.addCOASeatReservationAuthorization(req.params.id, authorization)(
            sskts.createTransactionAdapter(mongoose.connection));

        res.status(HTTPStatus.OK).json({
            data: {
                type: 'authorizations',
                id: authorization.id
            }
        });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id/authorizations/:authorization_id', async (req, res, next) => {
    // todo validations
    const validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }

    try {
        await sskts.service.transaction.removeAuthorization(req.params.id, req.params.authorization_id)(
            sskts.createTransactionAdapter(mongoose.connection)
        );

        res.status(HTTPStatus.NO_CONTENT).end();
    } catch (error) {
        next(error);
    }
});

router.patch('/:id/enableInquiry', async (req, res, next) => {
    req.checkBody('inquiry_theater', 'invalid inquiry_theater').notEmpty().withMessage('inquiry_theater is required');
    req.checkBody('inquiry_id', 'invalid inquiry_id').notEmpty().withMessage('inquiry_id is required');
    req.checkBody('inquiry_pass', 'invalid inquiry_pass').notEmpty().withMessage('inquiry_pass is required');

    const validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }

    try {
        const key = sskts.factory.transactionInquiryKey.create({
            theater_code: req.body.inquiry_theater,
            reserve_num: req.body.inquiry_id,
            tel: req.body.inquiry_pass
        });
        await sskts.service.transaction.enableInquiry(req.params.id, key)(sskts.createTransactionAdapter(mongoose.connection));

        res.status(HTTPStatus.NO_CONTENT).end();
    } catch (error) {
        next(error);
    }
});

router.post('/:id/notifications/email', async (req, res, next) => {
    req.checkBody('from', 'invalid from').notEmpty().withMessage('from is required');
    req.checkBody('to', 'invalid to').notEmpty().withMessage('to is required').isEmail();
    req.checkBody('subject', 'invalid subject').notEmpty().withMessage('subject is required');
    req.checkBody('content', 'invalid content').notEmpty().withMessage('content is required');

    const validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }

    try {
        const notification = sskts.factory.notification.createEmail({
            from: req.body.from,
            to: req.body.to,
            subject: req.body.subject,
            content: req.body.content
        });
        await sskts.service.transaction.addEmail(req.params.id, notification)(sskts.createTransactionAdapter(mongoose.connection));

        res.status(HTTPStatus.OK).json({
            data: {
                type: 'notifications',
                id: notification.id
            }
        });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id/notifications/:notification_id', async (req, res, next) => {
    // todo validations
    const validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }

    try {
        await sskts.service.transaction.removeEmail(req.params.id, req.params.notification_id)(
            sskts.createTransactionAdapter(mongoose.connection)
        );

        res.status(HTTPStatus.NO_CONTENT).end();
    } catch (error) {
        next(error);
    }
});

router.patch('/:id/close', async (req, res, next) => {
    const validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }

    try {
        await sskts.service.transaction.close(req.params.id)(sskts.createTransactionAdapter(mongoose.connection));

        res.status(HTTPStatus.NO_CONTENT).end();
    } catch (error) {
        next(error);
    }
});

export default router;
