import {BaseController} from "./BaseController";
import {JsonController, Get} from "routing-controllers";

@JsonController()
export class ScreenController extends BaseController {
    /**
     * スクリーン検索
     */
    @Get("/screens")
    find() {
        let results: Array<{
            _id: string,
            film_name: string
        }> = [];

        return {
            success: true,
            results: results
        };
    }
}
