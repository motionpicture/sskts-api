import express = require('express');
let router = express.Router();

import * as SSKTS from '@motionpicture/sskts-domain';
import mongoose = require('mongoose');

router.post('/makeInquiry', async (req, res, next) => {
    // TODO validation

    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        const key = SSKTS.TransactionInquiryKey.create({
            theater_code: req.body.inquiry_theater,
            reserve_num: req.body.inquiry_id,
            tel: req.body.inquiry_pass,
        });
        let option = await SSKTS.TransactionService.makeInquiry(key)(SSKTS.createTransactionRepository(mongoose.connection));

        option.match({
            Some: (transaction) => {
                res.json({
                    data: {
                        type: 'transactions',
                        _id: transaction._id,
                        attributes: transaction
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

router.get('/:id', async (req, res, next) => {
    // TODO validation

    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let option = await SSKTS.TransactionService.findById(req.params.id)(SSKTS.createTransactionRepository(mongoose.connection));
        option.match({
            Some: (transaction) => {
                res.json({
                    data: {
                        type: 'transactions',
                        _id: transaction._id,
                        attributes: transaction
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

router.post('', async (req, res, next) => {
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    // TODO ownersの型チェック
    // expired_atはsecondsのタイムスタンプで

    try {
        let transaction = await SSKTS.TransactionService.start(new Date(parseInt(req.body.expired_at) * 1000))(
            SSKTS.createOwnerRepository(mongoose.connection),
            SSKTS.createTransactionRepository(mongoose.connection)
        );

        res.status(201);
        res.setHeader('Location', `https://${req.headers['host']}/transactions/${transaction._id}`);
        res.json({
            data: {
                type: 'transactions',
                _id: transaction._id,
                attributes: transaction
            }
        });
    } catch (error) {
        next(error);
    }
});

router.patch('/:id/anonymousOwner', async (req, res, next) => {
    // req.checkBody('group', 'invalid group.').notEmpty();

    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        await SSKTS.TransactionService.updateAnonymousOwner({
            transaction_id: req.params.id,
            name_first: req.body.name_first,
            name_last: req.body.name_last,
            tel: req.body.tel,
            email: req.body.email,
        })(SSKTS.createOwnerRepository(mongoose.connection), SSKTS.createTransactionRepository(mongoose.connection));

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.post('/:id/authorizations/gmo', async (req, res, next) => {
    // TODO validations
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        const authorization = SSKTS.Authorization.createGMO({
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
            price: req.body.gmo_amount,
        });
        await SSKTS.TransactionService.addGMOAuthorization(req.params.id, authorization)(
            SSKTS.createTransactionRepository(mongoose.connection)
        );

        res.status(200).json({
            data: {
                type: 'authorizations',
                _id: authorization._id
            }
        });
    } catch (error) {
        next(error);
    }
});

router.post('/:id/authorizations/coaSeatReservation', async (req, res, next) => {
    // TODO validations
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        const authorization = SSKTS.Authorization.createCOASeatReservation({
            owner_from: req.body.owner_id_from,
            owner_to: req.body.owner_id_to,
            coa_tmp_reserve_num: parseInt(req.body.coa_tmp_reserve_num),
            coa_theater_code: req.body.coa_theater_code,
            coa_date_jouei: req.body.coa_date_jouei,
            coa_title_code: req.body.coa_title_code,
            coa_title_branch_num: req.body.coa_title_branch_num,
            coa_time_begin: req.body.coa_time_begin,
            coa_screen_code: req.body.coa_screen_code,
            assets: req.body.seats.map((seat: any) => {
                return SSKTS.Asset.createSeatReservation({
                    ownership: SSKTS.Ownership.create({
                        owner: mongoose.Types.ObjectId(req.body.owner_id_to),
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
            price: parseInt(req.body.price)
        });
        await SSKTS.TransactionService.addCOASeatReservationAuthorization(req.params.id, authorization)(
            SSKTS.createTransactionRepository(mongoose.connection));

        res.status(200).json({
            data: {
                type: 'authorizations',
                _id: authorization._id
            }
        });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id/authorizations/:authorization_id', async (req, res, next) => {
    // TODO validations
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        await SSKTS.TransactionService.removeAuthorization(req.params.id, req.params.authorization_id)(SSKTS.createTransactionRepository(mongoose.connection));

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.patch('/:id/enableInquiry', async (req, res, next) => {
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        const key = SSKTS.TransactionInquiryKey.create({
            theater_code: req.body.inquiry_theater,
            reserve_num: req.body.inquiry_id,
            tel: req.body.inquiry_pass
        });
        await SSKTS.TransactionService.enableInquiry(req.params.id, key)(SSKTS.createTransactionRepository(mongoose.connection));

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.post('/:id/notifications/email', async (req, res, next) => {
    // TODO validations
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        const notification = SSKTS.Notification.createEmail({
            from: req.body.from,
            to: req.body.to,
            subject: req.body.subject,
            content: req.body.content
        });
        await SSKTS.TransactionService.addEmail(req.params.id, notification)(SSKTS.createTransactionRepository(mongoose.connection));

        res.status(200).json({
            data: {
                type: 'notification_id',
                _id: notification._id
            }
        });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id/notifications/:notification_id', async (req, res, next) => {
    // TODO validations
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        await SSKTS.TransactionService.removeEmail(req.params.id, req.params.notification_id)(SSKTS.createTransactionRepository(mongoose.connection));

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.patch('/:id/close', async (req, res, next) => {
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        await SSKTS.TransactionService.close(req.params.id)(SSKTS.createTransactionRepository(mongoose.connection));

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;
