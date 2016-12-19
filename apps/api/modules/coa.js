"use strict";
const request = require("request");
const config = require("config");
function publishAccessToken(cb) {
    request.post({
        url: `${config.get("coa_api_endpoint")}/token/access_token`,
        form: {
            refresh_token: config.get("coa_api_refresh_token")
        },
        json: true
    }, (error, response, body) => {
        console.log("request /token/access_token processed.", body);
        if (error)
            return cb(error, null);
        if (typeof body === "string")
            return cb(new Error(body), null);
        if (body.message)
            return cb(new Error(body.message), null);
        cb(null, body.access_token);
    });
}
exports.publishAccessToken = publishAccessToken;
function findTheaterByCode(accessToken, code, cb) {
    request.get({
        url: `${config.get("coa_api_endpoint")}/api/v1/theater/${code}/theater/`,
        auth: { bearer: accessToken },
        json: true
    }, (error, response, body) => {
        console.log("request processed.", error, body);
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
}
exports.findTheaterByCode = findTheaterByCode;
;
function findFilmsByTheaterCode(accessToken, theaterCode, cb) {
    request.get({
        url: `${config.get("coa_api_endpoint")}/api/v1/theater/${theaterCode}/title/`,
        auth: { bearer: accessToken },
        json: true
    }, (error, response, body) => {
        console.log("request processed.", error, body);
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
}
exports.findFilmsByTheaterCode = findFilmsByTheaterCode;
