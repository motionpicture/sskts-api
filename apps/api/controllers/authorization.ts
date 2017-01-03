import * as AssetModel from "../../common/models/asset";
import * as AuthorizationModel from "../../common/models/authorization";
import * as COA from "../../common/utils/coa";

interface Create4reservationArgs {
    transaction: string,
    assets: Array<string>,
    // owner: string,
    // performance: string,
    // reservations: Array<{
    //     section: string,
    //     seat_code: string
    // }>
}
/**
 * 資産の承認をとる
 */
export function create4reservation(args: Create4reservationArgs) {
    interface result {
        _id: string,
        transaction: string,
        asset: string,
        owner: string,
        coa_tmp_reserve_num: string,
    }

    return new Promise((resolveAll: (results: Array<result>) => void, rejectAll: (err: Error) => void) => {
        // 今回は、COA連携なのでまずCOAAPIで確認
        AssetModel.default.find({
            _id: {$in: args.assets}
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
                // 2.assetにauthorizationが作成済みでないかどうか確認(今回は、COA連携なのでassetを確認せずに、アクティブな承認を作成)
                // 3.authorizationをアクティブにする

                let results: Array<result> = [];
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
                                if (err) return reject(err);

                                authorization.set("active", true);
                                authorization.save((err, authorization) => {
                                    if (err) return reject(err);

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

/**
 * 資産承認取消
 */
export function removeByCoaTmpReserveNum(tmpReserveNum: string) {
    return new Promise((resolve: () => void, reject: (err: Error) => void) => {
        // 承認を非アクティブに変更
        AuthorizationModel.default.update({
            coa_tmp_reserve_num: tmpReserveNum
        }, {
            active: false
        }, {
            multi: true
        }, (err, raw) => {
            console.log("authorizations updated.", err, raw);
            if (err) return reject(err);

            // 資産から承認IDを削除
            AuthorizationModel.default.find({
                coa_tmp_reserve_num: tmpReserveNum
            }, "asset").exec((err, authorizations) => {
                AssetModel.default.update({
                    _id: {$in: authorizations.map((authorization) => {return authorization.get("asset")})}
                }, {
                    $pullAll: { authorizations: authorizations.map((authorization) => {return authorization.get("_id")}) }
                }, {
                    multi: true
                }, (err, raw) => {
                    if (err) return reject(err);

                    // TODO COA座席仮予約削除
                    AssetModel.default.findOne({
                        _id: authorizations[0].get("asset")
                    }).populate({
                        path: "performance",
                        populate: {
                            path: "film"
                        }
                    }).exec((err, asset) => {
                        COA.deleteTmpReserveInterface.call({
                            theater_code: asset.get("performance").get("theater"),
                            date_jouei: asset.get("performance").get("day"),
                            title_code: asset.get("performance").get("film").get("film_group"),
                            title_branch_num: asset.get("performance").get("film").get("film_branch_code"),
                            time_begin: asset.get("performance").get("time_start"),
                            tmp_reserve_num: tmpReserveNum,
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