"use strict";
const AssetModel = require("../../common/models/asset");
const PerformanceModel = require("../../common/models/performance");
/**
 * 資産(座席予約)をインポートする
 */
function importSeatReservations(start, end) {
    return new Promise((resolveAll, rejectAll) => {
        PerformanceModel.default.find({
            day: { $gte: start, $lte: end }
        })
            .populate("screen", "sections")
            .exec((err, performances) => {
            if (err)
                return rejectAll(err);
            // パフォーマンスの資産を登録
            // あれば更新、なければ追加
            let assets4create = [];
            performances.map((performance) => {
                performance.get("screen").get("sections").map((section) => {
                    section.seats.map((seat) => {
                        assets4create.push({
                            owner: "5868e16789cc75249cdbfa4b",
                            group: AssetModel.GROUP_SEAT_RESERVATION,
                            performance: performance.get("_id"),
                            section: section.code,
                            seat_code: seat.code,
                            amount: 1800 // TODO 初期値
                        });
                    });
                });
            });
            let promises = assets4create.map((asset4create) => {
                return new Promise((resolve, reject) => {
                    AssetModel.default.create(asset4create).then((asset) => {
                        console.log("asset created.");
                        resolve();
                    }, (err) => {
                        console.log("asset created.", err.message);
                        reject(err);
                    });
                });
            });
            Promise.all(promises).then(() => {
                resolveAll();
            }, (err) => {
                rejectAll(err);
            });
        });
    });
}
exports.importSeatReservations = importSeatReservations;
