import {BaseController} from './BaseController';
import {JsonController, Param, Get} from "routing-controllers";

@JsonController()
export class PerformanceController extends BaseController {
    /**
     * パフォーマンス検索
     */
    @Get("/performances")
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

    /**
     * パフォーマンスをIDから取得
     */
    @Get("/performance/:id")
    findById(@Param("id") id: string) {
        return {
            success: true,
            result: {
                _id: id,
                film_name: 'film_name'
            }
        };
    }

    /**
     * 座席状態取得
     */
    @Get("/performance/:id/seatStatuses")
    getSeatStatuses(@Param("id") id: string) {
        return {
            success: true
        };
    }
}
