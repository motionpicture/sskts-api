import {BaseController} from "./BaseController";
import {JsonController, Get, Param} from "routing-controllers";
import request = require("request");
import config = require("config");

@JsonController()
export class TheaterController extends BaseController {
    /**
     * 劇場詳細をコードから取得する
     */
    @Get("/theater/:code")
    findByCode(@Param("code") code: string) {
        let theater: {
            theater_code: string,
            theater_name: string,
            theater_name_eng: string,
            theater_name_kana: string,
        }

        return new Promise((resolve, reject) => {
            this.publishAccessToken((err, accessToken) => {
                if (err) return reject(err);

                request.get({
                    url: `${config.get<string>("coa_api_endpoint")}/api/v1/theater/${code}/theater/`,
                    auth: {bearer: accessToken},
                    json: true
                }, (error, response, body) => {
                    this.logger.debug("request processed.", error, body);
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
            return {
                success: true,
                message: null,
                theater: result
            };
        }, (err) => {
            return {
                success: false,
                message: err.message
            }
        });
    }
}
