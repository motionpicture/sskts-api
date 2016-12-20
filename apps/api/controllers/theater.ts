import * as COA from "../modules/coa";

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
        COA.findTheaterByCode(code, (err, theater) => {
            if (err) return reject(err);

            resolve({
                theater_code: theater.theater_code,
                theater_name_ja: theater.theater_name,
                theater_name_en: theater.theater_name_eng,
                theater_name_kana: theater.theater_name_kana,
            });
        });
    });
}
