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

router.get("/films", (req, res, next) => {
    let films: Array<{
        title_code: string,
        title_branch_num: string,
        title_name: string,
        title_name_kana: string,
        title_name_eng: string,
        title_name_short: string,
        title_name_orig: string,
        kbn_eirin: string,
        kbn_eizou: string,
        kbn_joeihousiki: string,
        kbn_jimakufukikae: string,
        show_time: number,
        date_begin: string,
        date_end: string
    }> = [];

    return new Promise((resolve, reject) => {
        publishAccessToken((err, accessToken) => {
            if (err) return reject(err);

            console.log("theater_code is", req.query.theater_code);
            request.get({
                url: `${config.get<string>("coa_api_endpoint")}/api/v1/theater/${req.query.theater_code}/title/`,
                auth: {bearer: accessToken},
                json: true
            }, (error, response, body) => {
                if (error) return reject(error);
                if (typeof body === "string")  return reject(new Error(body));
                if (body.message) return reject(new Error(body.message));
                if (body.status !== 0) return reject(new Error(body.status));

                console.log("returning json...");
                resolve(body.list_title);
            });
        });
    }).then((results: typeof films) => {
        res.json({
            success: true,
            films: results
        });
    }, (err) => {
        res.json({
            success: false,
            message: err.message,
        });
    });
});

export default router;