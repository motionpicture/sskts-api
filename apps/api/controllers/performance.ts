import * as COA from "../../common/utils/coa";

/**
 * パフォーマンス検索
 */
export function find(theaterCode: string) {
    interface performance {
        date_jouei: string,
        title_code: string,
        title_branch_num: string,
        time_begin: string,
        time_end: string,
        screen_code: string,
        trailer_time: number,
        kbn_service: string,
        kbn_acoustic: string,
        name_service_day: string,
    };

    return new Promise((resolve: (screens: Array<performance>) => void, reject: (err: Error) => void) => {
        COA.findPerformancesByTheaterCode(theaterCode, (err, performances) => {
            if (err) return reject(err);

            resolve(performances);
        });
    });
}
