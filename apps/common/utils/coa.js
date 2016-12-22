"use strict";
const request = require("request");
const config = require("config");
/**
 * API認証情報
 */
var credentials = {
    access_token: "",
    expired_at: ""
};
/**
 * アクセストークンを発行する
 */
function publishAccessToken(cb) {
    // TODO アクセストークン有効期限チェック
    if (credentials.access_token) {
        return cb(null);
    }
    request.post({
        url: `${config.get("coa_api_endpoint")}/token/access_token`,
        form: {
            refresh_token: config.get("coa_api_refresh_token")
        },
        json: true
    }, (error, response, body) => {
        console.log("request processed.", body);
        if (error)
            return cb(error);
        if (typeof body === "string")
            return cb(new Error(body));
        if (body.message)
            return cb(new Error(body.message));
        credentials = body;
        cb(null);
    });
}
exports.publishAccessToken = publishAccessToken;
function findTheaterByCode(code, cb) {
    publishAccessToken((err) => {
        request.get({
            url: `${config.get("coa_api_endpoint")}/api/v1/theater/${code}/theater/`,
            auth: { bearer: credentials.access_token },
            json: true
        }, (error, response, body) => {
            console.log("request processed.", error);
            if (error)
                return cb(error, null);
            if (typeof body === "string")
                return cb(new Error(body), null);
            if (body.message)
                return cb(new Error(body.message), null);
            if (body.status !== 0)
                return cb(new Error(body.status), null);
            cb(null, {
                theater_code: body.theater_code,
                theater_name: body.theater_name,
                theater_name_eng: body.theater_name_eng,
                theater_name_kana: body.theater_name_kana,
            });
        });
    });
}
exports.findTheaterByCode = findTheaterByCode;
;
function findFilmsByTheaterCode(theaterCode, cb) {
    publishAccessToken((err) => {
        request.get({
            url: `${config.get("coa_api_endpoint")}/api/v1/theater/${theaterCode}/title/`,
            auth: { bearer: credentials.access_token },
            json: true
        }, (error, response, body) => {
            console.log("request processed.", error);
            if (error)
                return cb(error, null);
            if (typeof body === "string")
                return cb(new Error(body), null);
            if (body.message)
                return cb(new Error(body.message), null);
            if (body.status !== 0)
                return cb(new Error(body.status), null);
            cb(null, body.list_title);
        });
    });
}
exports.findFilmsByTheaterCode = findFilmsByTheaterCode;
;
function findScreensByTheaterCode(theaterCode, cb) {
    publishAccessToken((err) => {
        request.get({
            url: `${config.get("coa_api_endpoint")}/api/v1/theater/${theaterCode}/screen/`,
            auth: { bearer: credentials.access_token },
            json: true
        }, (error, response, body) => {
            console.log("request processed.", error);
            if (error)
                return cb(error, null);
            if (typeof body === "string")
                return cb(new Error(body), null);
            if (body.message)
                return cb(new Error(body.message), null);
            if (body.status !== 0)
                return cb(new Error(body.status), null);
            cb(null, body.list_screen);
        });
    });
}
exports.findScreensByTheaterCode = findScreensByTheaterCode;
var findPerformancesByTheaterCodeInterface;
(function (findPerformancesByTheaterCodeInterface) {
    function call(args, cb) {
        publishAccessToken((err) => {
            request.get({
                url: `${config.get("coa_api_endpoint")}/api/v1/theater/${args.theater_code}/schedule/`,
                auth: { bearer: credentials.access_token },
                json: true,
                qs: {
                    begin: args.begin,
                    end: args.end
                }
            }, (error, response, body) => {
                console.log("request processed.", error);
                if (error)
                    return cb(error, null);
                if (typeof body === "string")
                    return cb(new Error(body), null);
                if (body.message)
                    return cb(new Error(body.message), null);
                if (body.status !== 0)
                    return cb(new Error(body.status), null);
                cb(null, body.list_schedule);
            });
        });
    }
    findPerformancesByTheaterCodeInterface.call = call;
})(findPerformancesByTheaterCodeInterface = exports.findPerformancesByTheaterCodeInterface || (exports.findPerformancesByTheaterCodeInterface = {}));
