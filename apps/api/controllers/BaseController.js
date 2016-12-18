"use strict";
const log4js = require("log4js");
const request = require("request");
const config = require("config");
/**
 * ベースコントローラー
 */
class BaseController {
    constructor() {
        this.logger = log4js.getLogger("mongo");
    }
    /**
     * COAAPIのアクセストークンを発行する
     */
    publishAccessToken(cb) {
        request.post({
            url: `${config.get("coa_api_endpoint")}/token/access_token`,
            form: {
                refresh_token: config.get("coa_api_refresh_token")
            },
            json: true
        }, (error, response, body) => {
            this.logger.debug("request /token/access_token processed.", body);
            if (error)
                return cb(error, null);
            if (body.message)
                return cb(new Error(body.message), null);
            cb(null, body.access_token);
        });
    }
}
exports.BaseController = BaseController;
