import mongoose = require('mongoose');
import * as AssetModel from "../../common/models/asset";
import * as TransactionModel from "../../common/models/transaction";
import * as AuthorizationModel from "../../common/models/authorization";
import * as COA from "../../common/utils/coa";

/**
 * 資産の承認をとる
 */
export function create4reservation(args: {
    transaction: string,
    assets: Array<string>,
}) {
    interface result {
        _id: string,
        asset: string,
        owner: string,
        coa_tmp_reserve_num: string,
    }

    return new Promise((resolveAll: (results: Array<result>) => void, rejectAll: (err: Error) => void) => {
        // 今回は、COA連携なのでまずCOAAPIで確認
        AssetModel.default.find({
            _id: { $in: args.assets }
        }).populate({
            path: "performance",
            populate: {
                path: "film"
            }
        }).exec((err, assets) => {
            if (err) return rejectAll(err);

            COA.reserveSeatsTemporarilyInterface.call({
                theater_code: assets[0].get("performance").get("theater"),
                date_jouei: assets[0].get("performance").get("day"),
                title_code: assets[0].get("performance").get("film").get("film_group"),
                title_branch_num: assets[0].get("performance").get("film").get("film_branch_code"),
                time_begin: assets[0].get("performance").get("time_start"),
                list_seat: assets.map((asset) => {
                    return {
                        seat_section: asset.get("section"),
                        seat_num: asset.get("seat_code"),
                    };
                })
            }, (err, result) => {
                if (err) return rejectAll(err);

                // 本来は以下順序
                // 1.authorizationを非アクティブで作成
                // 2.assetにauthorizationが作成済みでないかどうか確認(今回は、COA連携なのでassetを確認せずに取引追加)
                // 3.authorizationをアクティブにする

                TransactionModel.default.findOne({
                    _id: args.transaction
                }, (err, transaction) => {
                    if (err) return rejectAll(err);
                    if (!transaction) return rejectAll(new Error("transaction not found."));

                    // 取引と資産に対して、承認情報をセット
                    assets.forEach((asset) => {
                        transaction.get("authorizations").push({
                            asset: asset.get("_id"),
                            owner: asset.get("owner"),
                            coa_tmp_reserve_num: result.tmp_reserve_num.toString(),
                            active: false,
                            group: AuthorizationModel.GROUP_ASSET
                        });
                    });
                    transaction.save((err, transaction) => {
                        if (err) rejectAll(err);

                        let promises = assets.map((asset) => {
                            return new Promise((resolve, reject) => {
                                asset.get("transactions").push(transaction.get("_id"));
                                asset.save((err, asset) => {
                                    if (err) return reject(err);
                                    resolve();
                                });
                            });
                        });

                        Promise.all(promises).then(() => {
                            // 資産の承認確認が全てとれたら承認をアクティブ化
                            transaction.get("authorizations").forEach((authorization: mongoose.Document) => {
                                if (authorization.get("coa_tmp_reserve_num") !== result.tmp_reserve_num.toString()) return;
                                authorization.set("active", true);
                            });
                            transaction.save((err, transaction) => {
                                if (err) rejectAll(err);

                                resolveAll(transaction.get("authorizations"));
                            });
                        }, (err) => {
                            rejectAll(err);
                        });
                    });
                });
            });
        });
    });
}

/**
 * 承認追加(GROUP_COA_SEAT_RESERVATION)
 */
export function create4coaSeatReservation(args: {
    transaction: string,
    authorizations: Array<{
        coa_tmp_reserve_num: string,
        performance: string,
        section: string,
        seat_code: string,
        ticket_code: string,
        ticket_name_ja: string,
        ticket_name_en: string,
        ticket_name_kana: string,
        std_price: number,
        add_price: number,
        dis_price: number,
        price: number,
    }>,
}) {
    interface result {
        success: boolean,
        messsge: string,
        authorization: any,
    }

    return new Promise((resolveAll: (results: Array<result>) => void, rejectAll: (err: Error) => void) => {
        // 今回は、COA連携なのでassetを確認せずに、authorizationをアクティブで作成
        let results: Array<result> = [];
        let promises = args.authorizations.map((authorizationArg) => {
            return new Promise((resolve, reject) => {
                AuthorizationModel.default.create({
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
                    owner: "5868e16789cc75249cdbfa4b", // TODO 運営者ID管理
                    active: true,
                }).then((authorization) => {
                    results.push({
                        success: true,
                        messsge: null,
                        authorization: authorization,
                    });

                    resolve();
                }, (err) => {
                    console.log(err)
                    results.push({
                        authorization: authorizationArg,
                        success: false,
                        messsge: err.message
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

/**
 * 資産承認取消
 */
export function removeByCoaTmpReserveNum(args: {
    /** 取引ID */
    transaction_id: string,
    /** COA仮予約番号 */
    tmp_reserve_num: string
}) {
    // 1.取引の承認を非アクティブに変更
    // 2.資産から取引を削除
    // 3.COA仮予約取消

    return new Promise((resolve: () => void, reject: (err: Error) => void) => {
        TransactionModel.default.findOne({
            _id: args.transaction_id,
            authorizations: { $elemMatch: { coa_tmp_reserve_num: args.tmp_reserve_num } }
        }).exec((err, transaction) => {
            if (err) return reject(err);
            if (!transaction) return reject(new Error("transaction with given tmp_reserve_num not found."));

            let assetIds: Array<string> = [];
            transaction.get("authorizations").forEach((authorization: mongoose.Document) => {
                if (authorization.get("coa_tmp_reserve_num") !== args.tmp_reserve_num) return;
                authorization.set("active", false);
                assetIds.push(authorization.get("asset"));
            });

            // 取引の承認を非アクティブに変更
            transaction.save((err, transaction) => {
                if (err) return reject(err);

                // 資産から取引を削除
                AssetModel.default.update({
                    _id: { $in: assetIds }
                }, {
                    $pullAll: { transactions: [transaction.get("_id")] }
                }, {
                    multi: true
                }, (err, raw) => {
                    if (err) return reject(err);

                    // COA仮予約取消
                    AssetModel.default.findOne({
                        _id: assetIds[0]
                    }).populate({
                        path: "performance",
                        populate: {
                            path: "film"
                        }
                    }).exec((err, asset) => {
                        if (err) return reject(err);
                        if (!asset) return reject(new Error("asset not found."));

                        COA.deleteTmpReserveInterface.call({
                            theater_code: asset.get("performance").get("theater"),
                            date_jouei: asset.get("performance").get("day"),
                            title_code: asset.get("performance").get("film").get("film_group"),
                            title_branch_num: asset.get("performance").get("film").get("film_branch_code"),
                            time_begin: asset.get("performance").get("time_start"),
                            tmp_reserve_num: args.tmp_reserve_num,
                        }, (err, success) => {
                            if (err) return reject(err);

                            resolve();
                        });
                    });
                });
            });
        });
    });
}
