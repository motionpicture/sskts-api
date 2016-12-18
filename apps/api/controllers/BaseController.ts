import log4js = require("log4js");
import request = require("request");
import config = require("config");

/**
 * ベースコントローラー
 */
export class BaseController {
    /** ロガー */
    protected logger: log4js.Logger;

    constructor() {
        this.logger = log4js.getLogger("mongo");
    }

    /**
     * COAAPIのアクセストークンを発行する
     */
    protected publishAccessToken(cb: (err: Error, accessToken: string) => void): void {
        request.post({
            url: `${config.get<string>("coa_api_endpoint")}/token/access_token`,
            form: {
                refresh_token: config.get<string>("coa_api_refresh_token")
            },
            json: true
        }, (error, response, body) => {
            this.logger.debug("request /token/access_token processed.", body);
            if (error) return cb(error, null);
            if (body.message) return cb(new Error(body.message), null);

            cb(null, body.access_token);
        });
    }
}
