import {theater as theaterModel} from "../../common/models";

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
        theaterModel.findOne({
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