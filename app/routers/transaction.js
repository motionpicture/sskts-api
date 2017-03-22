"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * transactionルーター
 *
 * @ignore
 */
const express = require("express");
const router = express.Router();
const sskts = require("@motionpicture/sskts-domain");
const httpStatus = require("http-status");
const moment = require("moment");
const mongoose = require("mongoose");
const authentication_1 = require("../middlewares/authentication");
const validator_1 = require("../middlewares/validator");
router.use(authentication_1.default);
router.post('/startIfPossible', (req, _, next) => {
    // expires_atはsecondsのUNIXタイムスタンプで
    req.checkBody('expires_at', 'invalid expires_at').notEmpty().withMessage('expires_at is required').isInt();
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const transactionOption = yield sskts.service.transaction.startIfPossible(moment.unix(parseInt(req.body.expires_at, 10)).toDate() // tslint:disable-line:no-magic-numbers
        )(sskts.adapter.owner(mongoose.connection), sskts.adapter.transaction(mongoose.connection));
        transactionOption.match({
            Some: (transaction) => {
                const host = req.headers['host']; // tslint:disable-line:no-string-literal
                res.setHeader('Location', `https://${host}/transactions/${transaction.id}`);
                res.json({
                    data: {
                        type: 'transactions',
                        id: transaction.id,
                        attributes: transaction
                    }
                });
            },
            None: () => {
                res.status(httpStatus.NOT_FOUND);
                res.json({
                    data: null
                });
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.post('/makeInquiry', (req, _, next) => {
    req.checkBody('inquiry_theater', 'invalid inquiry_theater').notEmpty().withMessage('inquiry_theater is required');
    req.checkBody('inquiry_id', 'invalid inquiry_id').notEmpty().withMessage('inquiry_id is required');
    req.checkBody('inquiry_pass', 'invalid inquiry_pass').notEmpty().withMessage('inquiry_pass is required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const key = sskts.factory.transactionInquiryKey.create({
            theater_code: req.body.inquiry_theater,
            reserve_num: req.body.inquiry_id,
            tel: req.body.inquiry_pass
        });
        const option = yield sskts.service.transaction.makeInquiry(key)(sskts.adapter.transaction(mongoose.connection));
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
                res.status(httpStatus.NOT_FOUND);
                res.json({
                    data: null
                });
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.get('/:id', (_1, _2, next) => {
    // todo validation
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const option = yield sskts.service.transactionWithId.findById(req.params.id)(sskts.adapter.transaction(mongoose.connection));
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
                res.status(httpStatus.NOT_FOUND);
                res.json({
                    data: null
                });
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.post('', (req, _, next) => {
    // expires_atはsecondsのUNIXタイムスタンプで
    req.checkBody('expires_at', 'invalid expires_at').notEmpty().withMessage('expires_at is required').isInt();
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        // tslint:disable-next-line:no-magic-numbers
        const transaction = yield sskts.service.transaction.startForcibly(moment.unix(parseInt(req.body.expires_at, 10)).toDate())(sskts.adapter.owner(mongoose.connection), sskts.adapter.transaction(mongoose.connection));
        // tslint:disable-next-line:no-string-literal
        const hots = req.headers['host'];
        res.status(httpStatus.CREATED);
        res.setHeader('Location', `https://${hots}/transactions/${transaction.id}`);
        res.json({
            data: {
                type: 'transactions',
                id: transaction.id,
                attributes: transaction
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.patch('/:id/anonymousOwner', (req, _, next) => {
    req.checkBody('name_first', 'invalid name_first').optional().notEmpty().withMessage('name_first should not be empty');
    req.checkBody('name_last', 'invalid name_last').optional().notEmpty().withMessage('name_last should not be empty');
    req.checkBody('tel', 'invalid tel').optional().notEmpty().withMessage('tel should not be empty');
    req.checkBody('email', 'invalid email').optional().notEmpty().withMessage('email should not be empty');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const errorOption = yield sskts.service.transactionWithId.updateAnonymousOwner({
            transaction_id: req.params.id,
            name_first: req.body.name_first,
            name_last: req.body.name_last,
            tel: req.body.tel,
            email: req.body.email
        })(sskts.adapter.owner(mongoose.connection), sskts.adapter.transaction(mongoose.connection));
        errorOption.match({
            Some: (error) => {
                res.status(httpStatus.BAD_REQUEST).json({
                    errors: [
                        {
                            title: 'invalid parameter',
                            detail: error.message
                        }
                    ]
                });
            },
            None: () => {
                res.status(httpStatus.NO_CONTENT).end();
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.post('/:id/authorizations/gmo', (req, _, next) => {
    req.checkBody('owner_from', 'invalid owner_from').notEmpty().withMessage('owner_from is required');
    req.checkBody('owner_to', 'invalid owner_to').notEmpty().withMessage('owner_to is required');
    req.checkBody('gmo_shop_id', 'invalid gmo_shop_id').notEmpty().withMessage('gmo_shop_id is required');
    req.checkBody('gmo_shop_pass', 'invalid gmo_shop_pass').notEmpty().withMessage('gmo_shop_pass is required');
    req.checkBody('gmo_order_id', 'invalid gmo_order_id').notEmpty().withMessage('gmo_order_id is required');
    req.checkBody('gmo_amount', 'invalid gmo_amount').notEmpty().withMessage('gmo_amount is required');
    req.checkBody('gmo_access_id', 'invalid gmo_access_id').notEmpty().withMessage('gmo_access_id is required');
    req.checkBody('gmo_access_pass', 'invalid gmo_access_pass').notEmpty().withMessage('gmo_access_pass is required');
    req.checkBody('gmo_job_cd', 'invalid gmo_job_cd').notEmpty().withMessage('gmo_job_cd is required');
    req.checkBody('gmo_pay_type', 'invalid gmo_pay_type').notEmpty().withMessage('gmo_pay_type is required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const authorization = sskts.factory.authorization.gmo.create({
            owner_from: req.body.owner_from,
            owner_to: req.body.owner_to,
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
        const errorOption = yield sskts.service.transactionWithId.addGMOAuthorization(req.params.id, authorization)(sskts.adapter.transaction(mongoose.connection));
        errorOption.match({
            Some: (error) => {
                res.status(httpStatus.BAD_REQUEST).json({
                    errors: [
                        {
                            title: 'invalid parameter',
                            detail: error.message
                        }
                    ]
                });
            },
            None: () => {
                res.status(httpStatus.OK).json({
                    data: {
                        type: 'authorizations',
                        id: authorization.id
                    }
                });
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.post('/:id/authorizations/coaSeatReservation', (req, _, next) => {
    req.checkBody('owner_from', 'invalid owner_from').notEmpty().withMessage('owner_from is required');
    req.checkBody('owner_to', 'invalid owner_to').notEmpty().withMessage('owner_to is required');
    req.checkBody('coa_tmp_reserve_num', 'invalid coa_tmp_reserve_num').notEmpty().withMessage('coa_tmp_reserve_num is required');
    req.checkBody('coa_theater_code', 'invalid coa_theater_code').notEmpty().withMessage('coa_theater_code is required');
    req.checkBody('coa_date_jouei', 'invalid coa_date_jouei').notEmpty().withMessage('coa_date_jouei is required');
    req.checkBody('coa_title_code', 'invalid coa_title_code').notEmpty().withMessage('coa_title_code is required');
    req.checkBody('coa_title_branch_num', 'invalid coa_title_branch_num').notEmpty().withMessage('coa_title_branch_num is required');
    req.checkBody('coa_time_begin', 'invalid coa_time_begin').notEmpty().withMessage('coa_time_begin is required');
    req.checkBody('coa_screen_code', 'invalid coa_screen_code').notEmpty().withMessage('coa_screen_code is required');
    req.checkBody('seats', 'invalid seats').notEmpty().withMessage('seats is required');
    req.checkBody('price', 'invalid price').notEmpty().withMessage('price is required').isInt();
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const authorization = sskts.factory.authorization.coaSeatReservation.create({
            owner_from: req.body.owner_from,
            owner_to: req.body.owner_to,
            // tslint:disable-next-line:no-magic-numbers
            coa_tmp_reserve_num: parseInt(req.body.coa_tmp_reserve_num, 10),
            coa_theater_code: req.body.coa_theater_code,
            coa_date_jouei: req.body.coa_date_jouei,
            coa_title_code: req.body.coa_title_code,
            coa_title_branch_num: req.body.coa_title_branch_num,
            coa_time_begin: req.body.coa_time_begin,
            coa_screen_code: req.body.coa_screen_code,
            assets: req.body.seats.map((seat) => {
                return sskts.factory.asset.seatReservation.create({
                    ownership: sskts.factory.ownership.create({
                        owner: req.body.owner_to,
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
        const errorOption = yield sskts.service.transactionWithId.addCOASeatReservationAuthorization(req.params.id, authorization)(sskts.adapter.transaction(mongoose.connection));
        errorOption.match({
            Some: (error) => {
                res.status(httpStatus.BAD_REQUEST).json({
                    errors: [
                        {
                            title: 'invalid parameter',
                            detail: error.message
                        }
                    ]
                });
            },
            None: () => {
                res.status(httpStatus.OK).json({
                    data: {
                        type: 'authorizations',
                        id: authorization.id
                    }
                });
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.post('/:id/authorizations/mvtk', (req, _, next) => {
    req.checkBody('owner_from', 'invalid owner_from').notEmpty().withMessage('owner_from is required');
    req.checkBody('owner_to', 'invalid owner_to').notEmpty().withMessage('owner_to is required');
    req.checkBody('price', 'invalid price').notEmpty().withMessage('price is required').isInt();
    req.checkBody('kgygish_cd', 'invalid kgygish_cd').notEmpty().withMessage('kgygish_cd is required');
    req.checkBody('yyk_dvc_typ', 'invalid yyk_dvc_typ').notEmpty().withMessage('yyk_dvc_typ is required');
    req.checkBody('trksh_flg', 'invalid trksh_flg').notEmpty().withMessage('trksh_flg is required');
    req.checkBody('kgygish_sstm_zskyyk_no', 'invalid kgygish_sstm_zskyyk_no')
        .notEmpty().withMessage('kgygish_sstm_zskyyk_no is required');
    req.checkBody('kgygish_usr_zskyyk_no', 'invalid kgygish_usr_zskyyk_no').notEmpty().withMessage('kgygish_usr_zskyyk_no is required');
    req.checkBody('jei_dt', 'invalid jei_dt').notEmpty().withMessage('jei_dt is required');
    req.checkBody('kij_ymd', 'invalid kij_ymd').notEmpty().withMessage('kij_ymd is required');
    req.checkBody('st_cd', 'invalid st_cd').notEmpty().withMessage('st_cd is required');
    req.checkBody('scren_cd', 'invalid scren_cd').notEmpty().withMessage('scren_cd is required');
    req.checkBody('knyknr_no_info', 'invalid knyknr_no_info').notEmpty().withMessage('knyknr_no_info is required');
    req.checkBody('zsk_info', 'invalid zsk_info').notEmpty().withMessage('zsk_info is required');
    req.checkBody('skhn_cd', 'invalid skhn_cd').notEmpty().withMessage('skhn_cd is required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const authorization = sskts.factory.authorization.mvtk.create({
            owner_from: req.body.owner_from,
            owner_to: req.body.owner_to,
            price: parseInt(req.body.price, 10),
            kgygish_cd: req.body.kgygish_cd,
            yyk_dvc_typ: req.body.yyk_dvc_typ,
            trksh_flg: req.body.trksh_flg,
            kgygish_sstm_zskyyk_no: req.body.kgygish_sstm_zskyyk_no,
            kgygish_usr_zskyyk_no: req.body.kgygish_usr_zskyyk_no,
            jei_dt: req.body.jei_dt,
            kij_ymd: req.body.kij_ymd,
            st_cd: req.body.st_cd,
            scren_cd: req.body.scren_cd,
            knyknr_no_info: req.body.knyknr_no_info,
            zsk_info: req.body.zsk_info,
            skhn_cd: req.body.skhn_cd
        });
        const errorOption = yield sskts.service.transactionWithId.addMvtkAuthorization(req.params.id, authorization)(sskts.adapter.transaction(mongoose.connection));
        errorOption.match({
            Some: (error) => {
                res.status(httpStatus.BAD_REQUEST).json({
                    errors: [
                        {
                            title: 'invalid parameter',
                            detail: error.message
                        }
                    ]
                });
            },
            None: () => {
                res.status(httpStatus.OK).json({
                    data: {
                        type: 'authorizations',
                        id: authorization.id
                    }
                });
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.delete('/:id/authorizations/:authorization_id', (_1, _2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const errorOption = yield sskts.service.transactionWithId.removeAuthorization(req.params.id, req.params.authorization_id)(sskts.adapter.transaction(mongoose.connection));
        errorOption.match({
            Some: (error) => {
                res.status(httpStatus.BAD_REQUEST).json({
                    errors: [
                        {
                            title: 'invalid parameter',
                            detail: error.message
                        }
                    ]
                });
            },
            None: () => {
                res.status(httpStatus.NO_CONTENT).end();
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.patch('/:id/enableInquiry', (req, _, next) => {
    req.checkBody('inquiry_theater', 'invalid inquiry_theater').notEmpty().withMessage('inquiry_theater is required');
    req.checkBody('inquiry_id', 'invalid inquiry_id').notEmpty().withMessage('inquiry_id is required');
    req.checkBody('inquiry_pass', 'invalid inquiry_pass').notEmpty().withMessage('inquiry_pass is required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const key = sskts.factory.transactionInquiryKey.create({
            theater_code: req.body.inquiry_theater,
            reserve_num: req.body.inquiry_id,
            tel: req.body.inquiry_pass
        });
        const errorOption = yield sskts.service.transactionWithId.enableInquiry(req.params.id, key)(sskts.adapter.transaction(mongoose.connection));
        errorOption.match({
            Some: (error) => {
                res.status(httpStatus.BAD_REQUEST).json({
                    errors: [
                        {
                            title: 'invalid parameter',
                            detail: error.message
                        }
                    ]
                });
            },
            None: () => {
                res.status(httpStatus.NO_CONTENT).end();
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.post('/:id/notifications/email', (req, _, next) => {
    req.checkBody('from', 'invalid from').notEmpty().withMessage('from is required');
    req.checkBody('to', 'invalid to').notEmpty().withMessage('to is required').isEmail();
    req.checkBody('subject', 'invalid subject').notEmpty().withMessage('subject is required');
    req.checkBody('content', 'invalid content').notEmpty().withMessage('content is required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const notification = sskts.factory.notification.email.create({
            from: req.body.from,
            to: req.body.to,
            subject: req.body.subject,
            content: req.body.content
        });
        yield sskts.service.transactionWithId.addEmail(req.params.id, notification)(sskts.adapter.transaction(mongoose.connection));
        res.status(httpStatus.OK).json({
            data: {
                type: 'notifications',
                id: notification.id
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.delete('/:id/notifications/:notification_id', (_1, _2, next) => {
    // todo validations
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const errorOption = yield sskts.service.transactionWithId.removeEmail(req.params.id, req.params.notification_id)(sskts.adapter.transaction(mongoose.connection));
        errorOption.match({
            Some: (error) => {
                res.status(httpStatus.BAD_REQUEST).json({
                    errors: [
                        {
                            title: 'invalid parameter',
                            detail: error.message
                        }
                    ]
                });
            },
            None: () => {
                res.status(httpStatus.NO_CONTENT).end();
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.patch('/:id/close', (_1, _2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const errorOption = yield sskts.service.transactionWithId.close(req.params.id)(sskts.adapter.transaction(mongoose.connection));
        errorOption.match({
            Some: (error) => {
                res.status(httpStatus.BAD_REQUEST).json({
                    errors: [
                        {
                            title: 'invalid parameter',
                            detail: error.message
                        }
                    ]
                });
            },
            None: () => {
                res.status(httpStatus.NO_CONTENT).end();
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
