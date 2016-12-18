"use strict";
const express = require("express");
let router = express.Router();
const request = require("request");
const config = require("config");
let publishAccessToken = (cb) => {
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
        if (body.message)
            return cb(new Error(body.message), null);
        cb(null, body.access_token);
    });
};
router.get("/theater/:code", (req, res, next) => {
    let theater;
    return new Promise((resolve, reject) => {
        publishAccessToken((err, accessToken) => {
            if (err)
                return reject(err);
            request.get({
                url: `${config.get("coa_api_endpoint")}/api/v1/theater/${req.params.code}/theater/`,
                auth: { bearer: accessToken },
                json: true
            }, (error, response, body) => {
                console.log("request processed.", error, body);
                if (error)
                    return reject(error);
                if (typeof body === "string")
                    return reject(new Error(body));
                if (body.message)
                    return reject(new Error(body.message));
                if (body.status !== 0)
                    return reject(new Error(body.status));
                theater = {
                    theater_code: body.theater_code,
                    theater_name: body.theater_name,
                    theater_name_eng: body.theater_name_eng,
                    theater_name_kana: body.theater_name_kana,
                };
                resolve(theater);
            });
        });
    }).then((result) => {
        res.json({
            success: true,
            message: null,
            theater: result
        });
    }, (err) => {
        res.json({
            success: false,
            message: err.message
        });
    });
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
