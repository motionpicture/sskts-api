"use strict";
const AuthorizationModel = require("../../common/models/authorization");
function create(args) {
    switch (args.group) {
        case AuthorizationModel.GROUP_COA_SEAT_RESERVATION:
            return create4coaSeatReservation({
                transaction: args.transaction,
                authorizations: args.authorizations,
            });
        default:
            return new Promise((resolve, reject) => {
                reject(new Error("invalid group."));
            });
    }
}
exports.create = create;
/**
 * 資産の承認をとる
 */
// export function create4reservation(args: {
//     transaction: string,
//     assets: Array<string>,
// }) {
//     interface result {
//         _id: string,
//         asset: string,
//         owner: string,
//         coa_tmp_reserve_num: string,
//     }
//     return new Promise((resolveAll: (results: Array<result>) => void, rejectAll: (err: Error) => void) => {
//         // 今回は、COA連携なのでまずCOAAPIで確認
//         AssetModel.default.find({
//             _id: { $in: args.assets }
//         }).populate({
//             path: "performance",
//             populate: {
//                 path: "film"
//             }
//         }).exec((err, assets) => {
//             if (err) return rejectAll(err);
//             COA.reserveSeatsTemporarilyInterface.call({
//                 theater_code: assets[0].get("performance").get("theater"),
//                 date_jouei: assets[0].get("performance").get("day"),
//                 title_code: assets[0].get("performance").get("film").get("film_group"),
//                 title_branch_num: assets[0].get("performance").get("film").get("film_branch_code"),
//                 time_begin: assets[0].get("performance").get("time_start"),
//                 list_seat: assets.map((asset) => {
//                     return {
//                         seat_section: asset.get("section"),
//                         seat_num: asset.get("seat_code"),
//                     };
//                 })
//             }, (err, result) => {
//                 if (err) return rejectAll(err);
//                 // 本来は以下順序
//                 // 1.authorizationを非アクティブで作成
//                 // 2.assetにauthorizationが作成済みでないかどうか確認(今回は、COA連携なのでassetを確認せずに取引追加)
//                 // 3.authorizationをアクティブにする
//                 TransactionModel.default.findOne({
//                     _id: args.transaction
//                 }, (err, transaction) => {
//                     if (err) return rejectAll(err);
//                     if (!transaction) return rejectAll(new Error("transaction not found."));
//                     // 取引と資産に対して、承認情報をセット
//                     assets.forEach((asset) => {
//                         transaction.get("authorizations").push({
//                             asset: asset.get("_id"),
//                             owner: asset.get("owner"),
//                             coa_tmp_reserve_num: result.tmp_reserve_num.toString(),
//                             active: false,
//                             group: AuthorizationModel.GROUP_ASSET
//                         });
//                     });
//                     transaction.save((err, transaction) => {
//                         if (err) rejectAll(err);
//                         let promises = assets.map((asset) => {
//                             return new Promise((resolve, reject) => {
//                                 asset.get("transactions").push(transaction.get("_id"));
//                                 asset.save((err, asset) => {
//                                     if (err) return reject(err);
//                                     resolve();
//                                 });
//                             });
//                         });
//                         Promise.all(promises).then(() => {
//                             // 資産の承認確認が全てとれたら承認をアクティブ化
//                             transaction.get("authorizations").forEach((authorization: mongoose.Document) => {
//                                 if (authorization.get("coa_tmp_reserve_num") !== result.tmp_reserve_num.toString()) return;
//                                 authorization.set("active", true);
//                             });
//                             transaction.save((err, transaction) => {
//                                 if (err) rejectAll(err);
//                                 resolveAll(transaction.get("authorizations"));
//                             });
//                         }, (err) => {
//                             rejectAll(err);
//                         });
//                     });
//                 });
//             });
//         });
//     });
// }
/**
 * 承認追加(GROUP_COA_SEAT_RESERVATION)
 */
function create4coaSeatReservation(args) {
    return new Promise((resolveAll, rejectAll) => {
        // 今回は、COA連携なのでassetを確認せずに、authorizationをアクティブで作成
        let results = [];
        let promises = args.authorizations.map((authorizationArg) => {
            return new Promise((resolve, reject) => {
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
/**
 * 承認追加(GROUP_GMO)
 */
function create4gmo(args) {
    return new Promise((resolveAll, rejectAll) => {
        // 今回は、COA連携なのでassetを確認せずに、authorizationをアクティブで作成
        let results = [];
        let promises = args.authorizations.map((authorizationArg) => {
            return new Promise((resolve, reject) => {
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
/**
 * 資産承認取消
 */
function remove(args) {
    // 1.取引の承認を非アクティブに変更
    // 2.資産から取引を削除(資産管理の場合)
    return new Promise((resolveAll, rejectAll) => {
        let results = [];
        let promises = args.authorizations.map((authorizationId) => {
            return new Promise((resolve, reject) => {
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
