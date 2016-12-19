import request = require("request");
import config = require("config");

export function publishAccessToken(cb: (err: Error, accessToken: string) => void): void {
    request.post({
        url: `${config.get<string>("coa_api_endpoint")}/token/access_token`,
        form: {
            refresh_token: config.get<string>("coa_api_refresh_token")
        },
        json: true
    }, (error, response, body) => {
        console.log("request /token/access_token processed.", body);
        if (error) return cb(error, null);
        if (typeof body === "string")  return cb(new Error(body), null);
        if (body.message) return cb(new Error(body.message), null);

        cb(null, body.access_token);
    });
}

export interface findTheaterByCodeResult {
    theater_code: string,
    theater_name: string,
    theater_name_eng: string,
    theater_name_kana: string
}
export function findTheaterByCode(accessToken: string, code: string, cb: (err: Error, theater: findTheaterByCodeResult) => void): void {
    request.get({
        url: `${config.get<string>("coa_api_endpoint")}/api/v1/theater/${code}/theater/`,
        auth: {bearer: accessToken},
        json: true
    }, (error, response, body) => {
        console.log("request processed.", error, body);
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
}

export interface findTheaterByCodeResult {
    theater_code: string,
    theater_name: string,
    theater_name_eng: string,
    theater_name_kana: string
}

export interface findFilmsByTheaterCodeResult {
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
};
export function findFilmsByTheaterCode(accessToken: string, theaterCode: string, cb: (err: Error, films: Array<findFilmsByTheaterCodeResult>) => void): void {
    request.get({
        url: `${config.get<string>("coa_api_endpoint")}/api/v1/theater/${theaterCode}/title/`,
        auth: {bearer: accessToken},
        json: true
    }, (error, response, body) => {
        console.log("request processed.", error, body);
        if (error) return cb(error, null);
        if (typeof body === "string")  return cb(new Error(body), null);
        if (body.message) return cb(new Error(body.message), null);
        if (body.status !== 0) return cb(new Error(body.status), null);

        cb(null, body.list_title);
    });
}
