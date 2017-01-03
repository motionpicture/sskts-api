import * as COA from "../../common/utils/coa";
import * as TheaterModel from "../../common/models/theater";

/**
 * コードから劇場情報を取得する
 */
export function findByCode(code: string) {
    interface theater {
        theater_code: string,
        theater_name_ja: string,
        theater_name_en: string,
        theater_name_kana: string
    }

    return new Promise((resolve: (result: theater) => void, reject: (err: Error) => void) => {
        TheaterModel.default.findOne({
            _id: code
        }, (err, theater) => {
            if (err) return reject(err);

            resolve({
                theater_code: theater.get("_id"),
                theater_name_ja: theater.get("name").ja,
                theater_name_en: theater.get("name").en,
                theater_name_kana: theater.get("name_kana")
            });
        })
    });
}

/**
 * コード指定で劇場情報をCOAからインポートする
 */
export function importByCode(code: string) {
    return new Promise((resolve, reject) => {
        COA.findTheaterInterface.call({
            theater_code: code
        }, (err, theater) => {
            if (err) return reject(err);

            // あれば更新、なければ追加
            // this.logger.debug('updating sponsor...');
            TheaterModel.default.findOneAndUpdate(
                {
                    _id: theater.theater_code
                },
                {
                    name: {
                        ja: theater.theater_name,
                        en: theater.theater_name_eng
                    },
                    name_kana: theater.theater_name_kana
                },
                {
                    new: true,
                    upsert: true
                },
                (err, theater) => {
                    console.log("theater updated.", theater);
                    // this.logger.debug('sponsor updated', err);
                    (err) ? reject(err) : resolve();
                }
            );
        });
    });
}
