import * as COA from "../modules/coa";

/**
 * スクリーン検索
 */
export function find(theaterCode: string) {
    interface screen {
        screen_code: string,
        screen_name: string,
        screen_name_eng: string,
        list_seat: Array<{
            seat_num: string,
            flg_special: string,
            flg_hc: string,
            flg_pair: string,
            flg_free: string,
            flg_spare: string
        }>
    };

    return new Promise((resolve: (screens: Array<screen>) => void, reject: (err: Error) => void) => {
        COA.findScreensByTheaterCode(theaterCode, (err, screens) => {
            if (err) return reject(err);

            resolve(screens);
        });
    });
}
