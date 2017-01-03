import request = require("request");
import config = require("config");

/**
 * API認証情報
 */
let credentials = {
    access_token: "",
    expired_at: ""
}

/**
 * アクセストークンを発行する
 */
function publishAccessToken(cb: (err: Error) => void): void {
    // TODO アクセストークン有効期限チェック
    if (credentials.access_token) {
        return cb(null);
    }

    request.post({
        url: `${config.get<string>("coa_api_endpoint")}/token/access_token`,
        form: {
            refresh_token: config.get<string>("coa_api_refresh_token")
        },
        json: true
    }, (error, response, body) => {
        if (error) return cb(error);
        if (typeof body === "string")  return cb(new Error(body));
        if (body.message) return cb(new Error(body.message));

        credentials = body;
        console.log("credentials:", credentials);

        cb(null);
    });
}

/**
 * 施設マスター抽出
 */
export namespace findTheaterInterface {
    export interface Args {
        /** 劇場コード */
        theater_code: string
    }
    export interface Theater {
        /** 施設コード */
        theater_code: string,
        /** 施設名称 */
        theater_name: string,
        /** 施設名称（カナ） */
        theater_name_eng: string,
        /** 施設名称（英） */
        theater_name_kana: string
    }
    export function call(args: Args, cb: (err: Error, theater: Theater) => void): void {
        publishAccessToken((err) => {
            request.get({
                url: `${config.get<string>("coa_api_endpoint")}/api/v1/theater/${args.theater_code}/theater/`,
                auth: {bearer: credentials.access_token},
                json: true
            }, (error, response, body) => {
                if (error) return cb(error, null);
                if (typeof body === "string")  return cb(new Error(body), null);
                if (body.message) return cb(new Error(body.message), null);
                if (body.status !== 0) return cb(new Error(body.status), null);

                cb(null, {
                    theater_code: body.theater_code,
                    theater_name: body.theater_name,
                    theater_name_eng: body.theater_name_eng,
                    theater_name_kana: body.theater_name_kana,
                });
            });
        });
    }
}

/**
 * 作品マスター抽出
 */
export namespace findFilmsByTheaterCodeInterface {
    export interface Args {
        /** 劇場コード */
        theater_code: string
    }
    export interface Film {
        /** 作品コード */
        title_code: string,
        /** 作品枝番 */
        title_branch_num: string,
        /** 作品タイトル名 */
        title_name: string,
        /** 作品タイトル名（カナ） */
        title_name_kana: string,
        /** 作品タイトル名（英） */
        title_name_eng: string,
        /** 作品タイトル名省略 */
        title_name_short: string,
        /** 原題 */
        title_name_orig: string,
        /** 映倫区分 */
        kbn_eirin: string,
        /** 映像区分 */
        kbn_eizou: string,
        /** 上映方式区分 */
        kbn_joueihousiki: string,
        /** 字幕吹替区分 */
        kbn_jimakufukikae: string,
        /** 上映時間 */
        show_time: number,
        /** 公演開始予定日 */
        date_begin: string,
        /** 公演終了予定日 */
        date_end: string
    };
    export function call(args: Args, cb: (err: Error, films: Array<Film>) => void): void {
        publishAccessToken((err) => {
            request.get({
                url: `${config.get<string>("coa_api_endpoint")}/api/v1/theater/${args.theater_code}/title/`,
                auth: {bearer: credentials.access_token},
                json: true
            }, (error, response, body) => {
                if (error) return cb(error, null);
                if (typeof body === "string")  return cb(new Error(body), null);
                if (body.message) return cb(new Error(body.message), null);
                if (body.status !== 0) return cb(new Error(body.status), null);

                cb(null, body.list_title);
            });
        });
    }
}

/**
 * スクリーンマスター抽出
 */
export namespace findScreensByTheaterCodeInterface {
    export interface Args {
        /** 劇場コード */
        theater_code: string
    }
    export interface Screen {
        /** スクリーンコード */
        screen_code: string,
        /** スクリーン名 */
        screen_name: string,
        /** スクリーン名（英） */
        screen_name_eng: string,
        /** 座席リスト */
        list_seat: Array<{
            /** 座席番号 */
            seat_num: string,
            /** 特別席フラグ */
            flg_special: string,
            /** 車椅子席フラグ */
            flg_hc: string,
            /** ペア席フラグ */
            flg_pair: string,
            /** 自由席フラグ */
            flg_free: string,
            /** 予備席フラグ */
            flg_spare: string
        }>
    };
    export function call(args: Args, cb: (err: Error, screens: Array<Screen>) => void): void {
        publishAccessToken((err) => {
            request.get({
                url: `${config.get<string>("coa_api_endpoint")}/api/v1/theater/${args.theater_code}/screen/`,
                auth: {bearer: credentials.access_token},
                json: true
            }, (error, response, body) => {
                if (error) return cb(error, null);
                if (typeof body === "string")  return cb(new Error(body), null);
                if (body.message) return cb(new Error(body.message), null);
                if (body.status !== 0) return cb(new Error(body.status), null);

                cb(null, body.list_screen);
            });
        });
    }
}

/**
 * スケジュールマスター抽出
 */
export namespace findPerformancesByTheaterCodeInterface {
    export interface Args {
        /** 劇場コード */
        theater_code: string,
        /** スケジュールを抽出する上映日の開始日　　※日付は西暦8桁 "YYYYMMDD" */
        begin: string,
        /** スケジュールを抽出する上映日の終了日　　※日付は西暦8桁 "YYYYMMDD" */
        end: string,
    }
    export interface Performance {
        /** 上映日 */
        date_jouei: string,
        /** 作品コード */
        title_code: string,
        /** 作品枝番 */
        title_branch_num: string,
        /** 上映開始時刻 */
        time_begin: string,
        /** 上映終了時刻 */
        time_end: string,
        /** スクリーンコード */
        screen_code: string,
        /** トレーラー時間 */
        trailer_time: number,
        /** サービス区分 */
        kbn_service: string,
        /** 音響区分 */
        kbn_acoustic: string,
        /** サービスデイ名称 */
        name_service_day: string,
    }
    export function call(args: Args, cb: (err: Error, screens: Array<Performance>) => void): void {
        publishAccessToken((err) => {
            request.get({
                url: `${config.get<string>("coa_api_endpoint")}/api/v1/theater/${args.theater_code}/schedule/`,
                auth: {bearer: credentials.access_token},
                json: true,
                qs: {
                    begin: args.begin,
                    end: args.end
                }
            }, (error, response, body) => {
                if (error) return cb(error, null);
                if (typeof body === "string")  return cb(new Error(body), null);
                if (body.message) return cb(new Error(body.message), null);
                if (body.status !== 0) return cb(new Error(body.status), null);

                cb(null, body.list_schedule);
            });
        });
    }
}

/**
 * 座席仮予約
 */
export namespace reserveSeatsTemporarilyInterface {
    export interface Args {
        /** 施設コード */
        theater_code: string,
        /** 上映日 */
        date_jouei: string,
        /** 作品コード */
        title_code: string,
        /** 作品枝番 */
        title_branch_num: string,
        /** 上映時刻 */
        time_begin: string,
        /** 予約座席数 */
        // cnt_reserve_seat: number,
        /** 予約座席リスト */
        list_seat: Array<{
            /** 座席セクション */
            seat_section: string,
            /** 座席番号 */
            seat_num: string,
        }>
    }
    export interface Result {
        /** 座席チケット仮予約番号 */
        tmp_reserve_num: string,
        /** 仮予約結果リスト(仮予約失敗時の座席毎の仮予約状況) */
        list_tmp_reserve: Array<{
            /** 座席セクション */
            seat_section: string,
            /** 座席番号 */
            seat_num: string,
            /** 仮予約ステータス */
            sts_tmp_reserve: string,
        }>
    }
    export function call(args: Args, cb: (err: Error, result: Result) => void): void {
        publishAccessToken((err) => {
            request.get({
                url: `${config.get<string>("coa_api_endpoint")}/api/v1/theater/${args.theater_code}/upd_tmp_reserve_seat/`,
                auth: {bearer: credentials.access_token},
                json: true,
                qs: {
                    date_jouei: args.date_jouei,
                    title_code: args.title_code,
                    title_branch_num: args.title_branch_num,
                    time_begin: args.time_begin,
                    cnt_reserve_seat: args.list_seat.length,
                    seat_section: args.list_seat.map((value) => {return value.seat_section;}),
                    seat_num: args.list_seat.map((value) => {return value.seat_num;}),
                },
                useQuerystring: true
            }, (error, response, body) => {
                if (error) return cb(error, null);
                if (typeof body === "string")  return cb(new Error(body), null);
                if (body.message) return cb(new Error(body.message), null);
                if (body.status !== 0) return cb(new Error(body.status), null);

                cb(null, {
                    tmp_reserve_num: body.tmp_reserve_num,
                    list_tmp_reserve: body.list_tmp_reserve
                });
            });
        });
    }
}
