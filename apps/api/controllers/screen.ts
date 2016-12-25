import * as COA from "../../common/utils/coa";
import {screen as screenModel} from "../../common/models";

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
        screenModel.findOne({
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

                    let seats = screen.list_seat.map((seat) => {
                        return {
                            code: seat.seat_num
                        };
                    });

                    // this.logger.debug('updating sponsor...');
                    screenModel.findOneAndUpdate(
                        {
                            _id: screen.screen_code
                        },
                        {
                            theater: theaterCode,
                            name: {
                                ja: screen.screen_name,
                                en: screen.screen_name_eng
                            },
                            sections: [
                                {
                                    code: "001",
                                    name: {
                                        ja: "セクション001",
                                        en: "section001",
                                    },
                                    seats: seats
                                }
                            ]
                        },
                        {
                            new: true,
                            upsert: true
                        },
                        (err) => {
                            console.log('screen updated.', err);
                            // this.logger.debug('sponsor updated', err);
                            (err) ? reject(err) : resolve();
                        }
                    );
                });
            });

            Promise.all(promises).then(() => {
                // this.logger.info('promised.');
                resolveAll();
            }, (err) => {
                // this.logger.error('promised.', err);
                rejectAll(err);
            });
        });
    });
}
