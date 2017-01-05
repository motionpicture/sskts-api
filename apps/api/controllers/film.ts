import * as FilmModel from "../../common/models/film";
import * as COA from "../../common/utils/coa";

/**
 * 作品詳細
 */
export function findById(id: string) {
    interface film {
        _id: string,
        name: {
            ja: string,
            en: string
        }
        name_kana: string
        name_short: string, // 作品タイトル名省略
        name_original: string, // 原題
        minutes: number, // 上映時間
        date_start: string, // 公演開始予定日※日付は西暦8桁 "YYYYMMDD"
        date_end: string, // 公演終了予定日※日付は西暦8桁 "YYYYMMDD"
        kbn_eirin: string, // 映倫区分(PG12,R15,R18)
        kbn_eizou: string, // 映像区分(２D、３D)
        kbn_joueihousiki: string, // 上映方式区分(ＩＭＡＸ，４ＤＸ等)
        kbn_jimakufukikae: string, // 字幕吹替区分(字幕、吹き替え)
        copyright: string, // コピーライト
        coa_title_code: string,
        coa_title_branch_num: string,
    }

    return new Promise((resolve: (result: film) => void, reject: (err: Error) => void) => {
        FilmModel.default.findOne({
            _id: id
        }, (err, film) => {
            if (err) return reject(err);
            if (!film) return reject(new Error("Not Found."));

            resolve({
                _id: film.get("_id"),
                name: film.get("name"),
                name_kana: film.get("name_kana"),
                name_short: film.get("name_short"),
                name_original: film.get("name_original"),
                minutes: film.get("minutes"),
                date_start: film.get("date_start"),
                date_end: film.get("date_end"),
                kbn_eirin: film.get("kbn_eirin"),
                kbn_eizou: film.get("kbn_eizou"),
                kbn_joueihousiki: film.get("kbn_joueihousiki"),
                kbn_jimakufukikae: film.get("kbn_jimakufukikae"),
                copyright: film.get("copyright"),
                coa_title_code: film.get("coa_title_code"),
                coa_title_branch_num: film.get("coa_title_branch_num"),
            });
        })
    });
}

/**
 * 劇場コード指定で作品情報をCOAからインポートする
 */
export function importByTheaterCode(theaterCode: string) {
    return new Promise((resolveAll, rejectAll) => {
        COA.findFilmsByTheaterCodeInterface.call({
            theater_code: theaterCode
        }, (err, films) => {
            if (err) return rejectAll(err);

            // あれば更新、なければ追加
            let promises = films.map((film) => {
                return new Promise((resolve, reject) => {
                    if (!film.title_code) return resolve();
                    if (!film.title_branch_num) return resolve();

                    // this.logger.debug('updating sponsor...');
                    FilmModel.default.findOneAndUpdate(
                        {
                            // title_codeは劇場をまたいで共有、title_branch_numは劇場毎に管理
                            _id: `${theaterCode}${film.title_code}${film.title_branch_num}`
                        },
                        {
                            coa_title_code: film.title_code,
                            coa_title_branch_num: film.title_branch_num,
                            theater: theaterCode,
                            name: {
                                ja: film.title_name,
                                en: film.title_name_eng
                            },
                            name_kana: film.title_name_kana, // 作品タイトル名（カナ）
                            name_short: film.title_name_short, // 作品タイトル名省略
                            name_original: film.title_name_orig, // 原題
                            minutes: film.show_time, // 上映時間
                            date_start: film.date_begin, // 公演開始予定日※日付は西暦8桁 "YYYYMMDD"
                            date_end: film.date_end, // 公演終了予定日※日付は西暦8桁 "YYYYMMDD"
                            kbn_eirin: film.kbn_eirin,
                            kbn_eizou: film.kbn_eizou,
                            kbn_joueihousiki: film.kbn_joueihousiki,
                            kbn_jimakufukikae: film.kbn_jimakufukikae,
                        },
                        {
                            new: true,
                            upsert: true
                        },
                        (err) => {
                            console.log('film updated.', err);
                            // this.logger.debug('sponsor updated', err);
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
