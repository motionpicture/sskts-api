import {BaseController} from "./BaseController";
import {JsonController, Get, Param} from "routing-controllers";

@JsonController()
export class TheaterController extends BaseController {
    /**
     * 劇場詳細をコードから取得する
     */
    @Get("/theater/:code")
    findByCode(@Param("code") id: string) {
        return {
            success: true,
            result: {
                _id: id,
                theater_name: "theater_name"
            }
        };
    }
}
