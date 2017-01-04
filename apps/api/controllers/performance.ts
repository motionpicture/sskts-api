import * as COA from "../../common/utils/coa";
import * as PerformanceModel from "../../common/models/performance";
import * as ScreenModel from "../../common/models/screen";
import * as AssetModel from "../../common/models/asset";

/**
 * パフォーマンス詳細
 */
export function findById(id: string) {
    interface performance {
        _id: string,
        screen: string,
        screen_name: {
            ja: string,
            en: string
        },
        theater: string,
        theater_name: {
            ja: string,
            en: string
        },
        film: string,
        film_name: {
            ja: string,
            en: string
        },
        day: string,
        time_start: string,
        time_end: string
    }

    return new Promise((resolve: (result: performance) => void, reject: (err: Error) => void) => {
        PerformanceModel.default.findOne({
            _id: id
        })
        .populate("film", "name minutes copyright")
        .exec((err, performance) => {
            if (err) return reject(err);
            if (!performance) return reject(new Error("Not Found."));

            resolve({
                _id: performance.get("_id"),
                screen: performance.get("screen"),
                screen_name: performance.get("screen_name"),
                theater: performance.get("theater"),
                theater_name: performance.get("theater_name"),
                film: performance.get("film").get("_id"),
                film_name: performance.get("film").get("name"),
                day: performance.get("day"),
                time_start: performance.get("time_start"),
                time_end: performance.get("time_end")
            });
        })
    });
}

/**
 * パフォーマンス検索
 */
interface conditions {
    day?: string,
    theater?: string
}
export function find(conditions: conditions) {
    interface performance {
        _id: string,
        screen: string,
        screen_name: {
            ja: string,
            en: string
        },
        theater: string,
        theater_name: {
            ja: string,
            en: string
        },
        film: string,
        film_name: {
            ja: string,
            en: string
        },
        day: string,
        time_start: string,
        time_end: string
    }


    // 検索条件を作成
    let andConditions: Array<Object> = [
        {_id: {$ne: null}}
    ];

    if (conditions.day) {
        andConditions.push({day: conditions.day});
    }

    if (conditions.theater) {
        andConditions.push({theater: conditions.theater});
    }

    return new Promise((resolve: (result: Array<performance>) => void, reject: (err: Error) => void) => {
        PerformanceModel.default.find({$and: andConditions})
        .populate("film", "name minutes copyright")
        .lean(true)
        .exec((err, performances: Array<performance>) => {
            if (err) return reject(err);

            resolve(performances);
        })
    });
}

/**
 * 劇場コード指定でパフォーマンス情報をCOAからインポートする
 */
export function importByTheaterCode(theaterCode: string, begin: string, end: string) {
    return new Promise((resolveAll, rejectAll) => {
        COA.findPerformancesByTheaterCodeInterface.call({
            theater_code: theaterCode,
            begin: begin,
            end: end,
        }, (err, performances) => {
            if (err) return rejectAll(err);

            ScreenModel.default.find({theater: theaterCode}, "name theater sections").populate("theater", "name").exec((err, screens) => {
                // あれば更新、なければ追加
                let promises = performances.map((performance) => {
                    return new Promise((resolve, reject) => {
                        if (!performance.title_code) return resolve();
                        if (!performance.title_branch_num) return resolve();
                        if (!performance.screen_code) return resolve();

                        // this.logger.debug("updating sponsor...");
                        let id = `${theaterCode}${performance.date_jouei}${performance.title_code}${performance.title_branch_num}${performance.screen_code}${performance.time_begin}`;
                        let screenCode = `${theaterCode}${performance.screen_code}`;
                        let filmCode = `${theaterCode}${performance.title_code}${performance.title_branch_num}`;

                        // 劇場とスクリーン名称を追加
                        let _screen = screens.find((screen) => {
                            return (screen.get("_id").toString() === screenCode);
                        });
                        if (!_screen) return reject("no screen.");

                        console.log("updating performance...");
                        PerformanceModel.default.findOneAndUpdate(
                            {
                                _id: id
                            },
                            {
                                screen:  _screen.get("_id"),
                                screen_name: _screen.get("name"),
                                theater: _screen.get("theater").get("_id"),
                                theater_name: _screen.get("theater").get("name"),
                                film: filmCode,
                                day: performance.date_jouei,
                                time_start: performance.time_begin,
                                time_end: performance.time_end
                            },
                            {
                                new: true,
                                upsert: true
                            },
                            (err, performance) => {
                                console.log("performance updated.", err);
                                if (err) return reject(err); 
                                // this.logger.debug("sponsor updated", err);
                                resolve();
                            }
                        );
                    });
                });

                Promise.all(promises).then(() => {
                    resolveAll();
                }, (err) => {
                    rejectAll(err);
                });
            });
        });
    });
}

/**
 * 座席予約状態を取得する
 */
export function getAssets(id: string) {
    interface Result {
        _id: string,
        section: string,
        seat_code: string,
        ticket_type: string,
        amount: number,
        avalilable: boolean,
    }
    return new Promise((resolve: (results: Array<Result>) => void, reject: (err: Error) => void) => {
        PerformanceModel.default.findOne({
            _id: id
        }).populate("film").exec((err, performance) => {
            if (err) return reject(err);
            if (!performance) return reject(new Error("performance not found."));

            AssetModel.default.find({
                group: AssetModel.GROUP_SEAT_RESERVATION,
                performance: id
            }).exec((err, assets) => {
                if (err) return reject(err);
                if (assets.length === 0) return resolve([]);

                // COA座席予約状態抽出
                COA.getStateReserveSeatInterface.call({
                    theater_code: performance.get("theater"),
                    date_jouei: performance.get("day"),
                    title_code: performance.get("film").get("film_group"),
                    title_branch_num: performance.get("film").get("film_branch_code"),
                    time_begin: performance.get("time_start"),
                }, (err, result) => {
                    if (err) return reject(err);

                    // セクションごとの、利用可能座席コードリスト
                    let availableSeatCodesBySecton: {
                        [sectionCode: string]: Array<string>;
                    } = {};
                    result.list_seat.forEach((value) => {
                        availableSeatCodesBySecton[value.seat_section] = value.list_free_seat.map((freeSeat) => {
                            return freeSeat.seat_num;
                        });
                    });;

                    let results = assets.map((asset) => {
                        return {
                            _id: asset.get("_id"),
                            section: asset.get("section"),
                            seat_code: asset.get("seat_code"),
                            ticket_type: asset.get("ticket_type"),
                            amount: asset.get("amount"),
                            avalilable: (availableSeatCodesBySecton[asset.get("section")] && availableSeatCodesBySecton[asset.get("section")].indexOf(asset.get("seat_code")) >= 0) ? true : false
                        };
                    });

                    resolve(results);
                });
            });
        });
    });
}