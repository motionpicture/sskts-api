import COA = require("@motionpicture/coa-service");
import * as ScreenModel from "../../common/models/screen";

/**
 * スクリーン詳細
 */
export function findById(id: string) {
    interface screen {
        _id: string,
        theater: string,
        name: {
            ja: string,
            en: string
        },
        seats_number: number,
        sections: [
            {
                code: string,
                name: {
                    ja: string,
                    en: string,
                },
                seats: [
                    {
                        code: string,
                    }
                ]
            }
        ]
    }

    return new Promise((resolve: (result: screen) => void, reject: (err: Error) => void) => {
        ScreenModel.default.findOne({
            _id: id
        })
        .exec((err, screen) => {
            if (err) return reject(err);
            if (!screen) return reject(new Error("Not Found."));

            resolve({
                _id: screen.get("_id"),
                theater: screen.get("theater"),
                name: screen.get("name"),
                seats_number: screen.get("seats_number"),
                sections: screen.get("sections")
            });
        })
    });
}

/**
 * 劇場コード指定でスクリーン情報をCOAからインポートする
 */
export function importByTheaterCode(theaterCode: string) {
    return new Promise((resolveAll, rejectAll) => {
        COA.findScreensByTheaterCodeInterface.call({
            theater_code: theaterCode
        }, (err, screens) => {
            if (err) return rejectAll(err);

            // あれば更新、なければ追加
            let promises = screens.map((screen) => {
                return new Promise((resolve, reject) => {
                    if (!screen.screen_code) return resolve();

                    let sections: Array<{
                        code: string,
                        name: {
                            ja: string,
                            en: string,
                        },
                        seats: Array<{
                            code: string
                        }>
                    }> = [];
                    let sectionCodes: Array<string> = [];
                    screen.list_seat.forEach((seat) => {
                        if (sectionCodes.indexOf(seat.seat_section) < 0) {
                            sectionCodes.push(seat.seat_section);
                            sections.push({
                                code: seat.seat_section,
                                name: {
                                    ja: `セクション${seat.seat_section}`,
                                    en: `section${seat.seat_section}`,
                                },
                                seats: []
                            });
                        }

                        sections[sectionCodes.indexOf(seat.seat_section)].seats.push({
                            code: seat.seat_num
                        });
                    });

                    console.log('updating screen...');
                    ScreenModel.default.findOneAndUpdate(
                        {
                            _id: `${theaterCode}${screen.screen_code}`
                        },
                        {
                            theater: theaterCode,
                            coa_screen_code: screen.screen_code,
                            name: {
                                ja: screen.screen_name,
                                en: screen.screen_name_eng
                            },
                            sections: sections
                        },
                        {
                            new: true,
                            upsert: true
                        },
                        (err) => {
                            console.log('screen updated.', err);
                            (err) ? reject(err) : resolve();
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
}
