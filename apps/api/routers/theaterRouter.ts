import express = require('express')
let router = express.Router();
import request = require("request");
import config = require("config");

let publishAccessToken = (cb: (err: Error, accessToken: string) => void) => {
    request.post({
        url: `${config.get<string>("coa_api_endpoint")}/token/access_token`,
        form: {
            refresh_token: config.get<string>("coa_api_refresh_token")
        },
        json: true
    }, (error, response, body) => {
        console.log("request /token/access_token processed.", body);
        if (error) return cb(error, null);
        if (body.message) return cb(new Error(body.message), null);

        cb(null, body.access_token);
    });
}

router.get("/theater/:code", (req, res, next) => {
    let theater: {
        theater_code: string,
        theater_name: string,
        theater_name_eng: string,
        theater_name_kana: string,
    }

    return new Promise((resolve, reject) => {
        publishAccessToken((err, accessToken) => {
            if (err) return reject(err);

            request.get({
                url: `${config.get<string>("coa_api_endpoint")}/api/v1/theater/${req.params.code}/theater/`,
                auth: {bearer: accessToken},
                json: true
            }, (error, response, body) => {
                console.log("request processed.", error, body);
                if (error) return reject(error);
                if (typeof body === "string")  return reject(new Error(body));
                if (body.message) return reject(new Error(body.message));
                if (body.status !== 0) return reject(new Error(body.status));

                theater = {
                    theater_code: body.theater_code,
                    theater_name: body.theater_name,
                    theater_name_eng: body.theater_name_eng,
                    theater_name_kana: body.theater_name_kana,
                }

                resolve(theater);
            });
        });
    }).then((result: typeof theater) => {
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

export default router;