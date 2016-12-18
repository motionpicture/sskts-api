import {BaseController} from "./BaseController";
import {JsonController, Get, QueryParam} from "routing-controllers";
import request = require("request");
import config = require("config");

@JsonController()
export class FilmController extends BaseController {
    /**
     * 作品検索
     */
    @Get("/films")
    find(@QueryParam("theater_code") theaterCode: string) {
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
            this.publishAccessToken((err, accessToken) => {
                if (err) return reject(err);

                request.get({
                    url: `${config.get<string>("coa_api_endpoint")}/api/v1/theater/${theaterCode}/title/`,
                    auth: {bearer: accessToken},
                    json: true
                }, (error, response, body) => {
                    if (error) return reject(error);
                    if (typeof body === "string")  return reject(new Error(body));
                    if (body.message) return reject(new Error(body.message));
                    if (body.status !== 0) return reject(new Error(body.status));

                    resolve(body.list_title);
                });
            });
        }).then((results: typeof films) => {
            return {
                success: true,
                films: results
            };
        }, (err) => {
            return {
                success: false,
                message: err.message,
            }
        });
    }
}
