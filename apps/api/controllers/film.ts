import * as COA from "../modules/coa";

/**
 * 作品検索
 */
export function find(theaterCode: string) {
    interface film {
        title_code: string,
        title_branch_num: string,
        title_name: string,
        title_name_kana: string,
        title_name_eng: string,
        title_name_short: string,
        title_name_orig: string,
        kbn_eirin: string,
        kbn_eizou: string,
        kbn_joueihousiki: string,
        kbn_jimakufukikae: string,
        show_time: number,
        date_begin: string,
        date_end: string
    }

    return new Promise((resolve: (films: Array<film>) => void, reject: (err: Error) => void) => {
        COA.publishAccessToken((err, accessToken) => {
            if (err) return reject(err);

            COA.findFilmsByTheaterCode(accessToken, theaterCode, (err, films) => {
                if (err) return reject(err);

                resolve(films);
            });
        });
    });
}
