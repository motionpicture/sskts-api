import {Request} from "express";
import {BaseController} from "./BaseController";
import {JsonController, Req, Get, Param, UseBefore} from "routing-controllers";
import {COAOAuthMiddleware} from "../middlewares/COAOAuthMiddleware"; 
import requestModule = require("request");

@JsonController()
export class TheaterController extends BaseController {
    /**
     * 劇場詳細をコードから取得する
     */
    @Get("/theater/:code")
    @UseBefore(COAOAuthMiddleware)
    findByCode(@Param("code") id: string, @Req() request: Request) {
        return new Promise((resolve, reject) => {
            requestModule.get({
                url: "http://coacinema.aa0.netvolante.jp/api/v1/theater/001/theater/",
                auth: {
                    'bearer': request["access_token"]
                }
            }, (error, response, body) => {
                if (error) return reject(error);
                if (body.message) return reject(new Error(body.message));

                resolve(body);
            });
        }).then((body) => {
            return {
                success: true,
                message: null,
                result: body
            };
        }, (err) => {
            return {
                success: false,
                message: err.message,
                result: null
            }
        });
    }
}
