"use strict";
const AuthorizationModel = require("../../common/models/authorization");
function create(args) {
    return new Promise((resolve, reject) => {
        switch (args.group) {
            case AuthorizationModel.GROUP_COA_SEAT_RESERVATION:
                create4coaSeatReservation({
                    transaction: args.transaction,
                    authorizations: args.authorizations,
                }).then((results) => {
                    resolve(results);
                }, (err) => {
                    reject(err);
                });
                break;
            default:
                reject(new Error("invalid group."));
                break;
        }
    });
}
exports.create = create;
function create4coaSeatReservation(args) {
    return new Promise((resolveAll, rejectAll) => {
        let results = [];
        let promises = args.authorizations.map((authorizationArg) => {
            return new Promise((resolve) => {
                AuthorizationModel.default.create({
                    transaction: args.transaction,
                    coa_tmp_reserve_num: authorizationArg.coa_tmp_reserve_num,
                    performance: authorizationArg.performance,
                    section: authorizationArg.section,
                    seat_code: authorizationArg.seat_code,
                    ticket_code: authorizationArg.ticket_code,
                    ticket_name_ja: authorizationArg.ticket_name_ja,
                    ticket_name_en: authorizationArg.ticket_name_en,
                    ticket_name_kana: authorizationArg.ticket_name_kana,
                    std_price: authorizationArg.std_price,
                    add_price: authorizationArg.add_price,
                    dis_price: authorizationArg.dis_price,
                    price: authorizationArg.price,
                    group: AuthorizationModel.GROUP_COA_SEAT_RESERVATION,
                    owner: "5868e16789cc75249cdbfa4b",
                    active: true,
                }).then((authorization) => {
                    results.push({
                        success: true,
                        message: null,
                        authorization: authorization,
                    });
                    resolve();
                }, (err) => {
                    console.log(err);
                    results.push({
                        authorization: authorizationArg,
                        success: false,
                        message: err.message
                    });
                    resolve();
                });
            });
        });
        Promise.all(promises).then(() => {
            resolveAll(results);
        }, (err) => {
            rejectAll(err);
        });
    });
}
exports.create4coaSeatReservation = create4coaSeatReservation;
function create4gmo(args) {
    return new Promise((resolveAll, rejectAll) => {
        let results = [];
        let promises = args.authorizations.map((authorizationArg) => {
            return new Promise((resolve) => {
                AuthorizationModel.default.create({
                    transaction: args.transaction,
                    gmo_shop_id: authorizationArg.gmo_shop_id,
                    gmo_shop_password: authorizationArg.gmo_shop_pass,
                    gmo_amount: authorizationArg.gmo_amount,
                    gmo_access_id: authorizationArg.gmo_access_id,
                    gmo_access_password: authorizationArg.gmo_access_pass,
                    gmo_job_cd: authorizationArg.gmo_job_cd,
                    gmo_tax: authorizationArg.gmo_tax,
                    gmo_forward: authorizationArg.gmo_forward,
                    gmo_method: authorizationArg.gmo_method,
                    gmo_approve: authorizationArg.gmo_approve,
                    gmo_tran_id: authorizationArg.gmo_tran_id,
                    gmo_tran_date: authorizationArg.gmo_tran_date,
                    gmo_pay_type: authorizationArg.gmo_pay_type,
                    gmo_cvs_code: authorizationArg.gmo_cvs_code,
                    gmo_cvs_conf_no: authorizationArg.gmo_cvs_conf_no,
                    gmo_cvs_receipt_no: authorizationArg.gmo_cvs_receipt_no,
                    gmo_cvs_receipt_url: authorizationArg.gmo_cvs_receipt_url,
                    gmo_payment_term: authorizationArg.gmo_payment_term,
                    price: authorizationArg.price,
                    owner: authorizationArg.owner,
                    group: AuthorizationModel.GROUP_GMO,
                    active: true,
                }).then((authorization) => {
                    results.push({
                        success: true,
                        message: null,
                        authorization: authorization,
                    });
                    resolve();
                }, (err) => {
                    console.log(err);
                    results.push({
                        authorization: authorizationArg,
                        success: false,
                        message: err.message
                    });
                    resolve();
                });
            });
        });
        Promise.all(promises).then(() => {
            resolveAll(results);
        }, (err) => {
            rejectAll(err);
        });
    });
}
exports.create4gmo = create4gmo;
function remove(args) {
    return new Promise((resolveAll, rejectAll) => {
        let results = [];
        let promises = args.authorizations.map((authorizationId) => {
            return new Promise((resolve) => {
                AuthorizationModel.default.findOneAndUpdate({
                    _id: authorizationId,
                    transaction: args.transaction
                }, {
                    active: false
                }, {
                    new: true,
                    upsert: false
                }, (err, authorization) => {
                    if (err) {
                        results.push({
                            success: false,
                            message: err.message,
                            authorization: authorizationId
                        });
                    }
                    else if (!authorization) {
                        results.push({
                            success: false,
                            message: "authorization not found.",
                            authorization: authorizationId
                        });
                    }
                    else {
                        results.push({
                            success: true,
                            message: null,
                            authorization: authorizationId
                        });
                    }
                    resolve();
                });
            });
        });
        Promise.all(promises).then(() => {
            resolveAll(results);
        }, (err) => {
            rejectAll(err);
        });
    });
}
exports.remove = remove;
