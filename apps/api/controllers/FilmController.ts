import {BaseController} from "./BaseController";
import {JsonController, Get} from "routing-controllers";

@JsonController()
export class FilmController extends BaseController {
    /**
     * 作品検索
     */
    @Get("/films")
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
