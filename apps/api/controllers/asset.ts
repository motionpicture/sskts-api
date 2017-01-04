import * as AssetModel from "../../common/models/asset";
import * as PerformanceModel from "../../common/models/performance";

/**
 * 資産(座席予約)をインポートする
 */
export function importSeatReservations(start: string, end: string) {
    return new Promise((resolveAll, rejectAll) => {
        PerformanceModel.default.find({
            day: {$gte: start, $lte: end}
        })
        .populate("screen", "sections")
        .exec((err, performances) => {
            if (err) return rejectAll(err);

            // パフォーマンスの資産を登録
            // あれば更新、なければ追加
            let assets4create: Array<{
                owner: string,
                group: string,
                performance: string,
                section: string,
                seat_code: string,
                price: number,
                // TODO 券種も？
            }> = [];

            performances.map((performance) => {
                performance.get("screen").get("sections").map((section: any) => {
                    section.seats.map((seat: any) => {
                        assets4create.push({
                            owner: "5868e16789cc75249cdbfa4b", // TODO 運営者コード固定化
                            group: AssetModel.GROUP_SEAT_RESERVATION,
                            performance: performance.get("_id"),
                            section: section.code,
                            seat_code: seat.code,
                            price: 1800 // TODO 初期値?
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
