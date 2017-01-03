"use strict";
const AssetModel = require("../../common/models/asset");
const AuthorizationModel = require("../../common/models/authorization");
const COA = require("../../common/utils/coa");
/**
 * 資産の承認をとる
 */
function create4reservation(args) {
    return new Promise((resolveAll, rejectAll) => {
        // 今回は、COA連携なのでまずCOAAPIで確認
        // パフォーマンス情報を取得
        AssetModel.default.find({
            _id: { $in: args.assets }
        }).populate({
            path: "performance",
            populate: {
                path: "film"
            }
        }).exec((err, assets) => {
            if (err)
                return rejectAll(err);
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
                if (err)
                    return rejectAll(err);
                // 本来は以下順序
                // 1.authorizationを非アクティブで作成
                // 2.assetにauthorizationが作成済みでないかどうか確認(今回は、COA連携なのでassetを確認せずに、アクティブな承認を作成)
                // 3.authorizationをアクティブにする
                let results = [];
                let promises = assets.map((asset) => {
                    return new Promise((resolve, reject) => {
                        AuthorizationModel.default.create({
                            transaction: args.transaction,
                            asset: asset.get("_id"),
                            owner: asset.get("owner"),
                            coa_tmp_reserve_num: result.tmp_reserve_num,
                            active: false
                        }).then((authorization) => {
                            asset.set("authorizations", [authorization.get("_id")]);
                            asset.save((err, asset) => {
                                if (err)
                                    return reject(err);
                                authorization.set("active", true);
                                authorization.save((err, authorization) => {
                                    if (err)
                                        return reject(err);
                                    results.push({
                                        _id: authorization.get("_id"),
                                        transaction: authorization.get("transaction"),
                                        asset: authorization.get("asset"),
                                        owner: authorization.get("owner"),
                                        coa_tmp_reserve_num: authorization.get("coa_tmp_reserve_num"),
                                    });
                                    resolve();
                                });
                            });
                        }, (err) => {
                            reject(err);
                        });
                    });
                });
                Promise.all(promises).then(() => {
                    resolveAll(results);
                }, (err) => {
                    rejectAll(err);
                });
            });
        });
    });
}
exports.create4reservation = create4reservation;
