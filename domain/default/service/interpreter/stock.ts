import StockService from "../stock";
import AssetAuthorization from "../../model/authorization/asset";
import COASeatReservationAuthorization from "../../model/authorization/coaSeatReservation";
import AssetRepository from "../../repository/asset";
// import COA = require("@motionpicture/coa-service");

/**
 * 在庫サービス
 */
class StockServiceInterpreter implements StockService {
    /** 資産承認解除 */
    unauthorizeAsset(authorization: AssetAuthorization) {
        return async (assetRepository: AssetRepository) => {
            console.log(authorization);
            console.log(assetRepository);
        }
    }

    /** 資産移動 */
    transferAssset(authorization: AssetAuthorization) {
        return async (assetRepository: AssetRepository) => {
            console.log(authorization);
            console.log(assetRepository);
        }
    }

    /** 資産承認解除(COA座席予約) */
    async unauthorizeCOASeatReservation(authorization: COASeatReservationAuthorization) {
        console.log(authorization);
    }

    /** 資産移動(COA座席予約) */
    transferCOASeatReservation(authorization: COASeatReservationAuthorization) {
        return async (assetRepository: AssetRepository) => {

            // ウェブフロントで事前に本予約済みなので不要
            // let performance = authorization.seats[0].performance;
            // await COA.updateReserveInterface.call({
            //     theater_code: "001",
            //     date_jouei: "20170131",
            //     title_code: "8513",
            //     title_branch_num: "0",
            //     time_begin: "1010",
            //     // screen_code: "2",
            //     tmp_reserve_num: authorization.coa_tmp_reserve_num,
            //     reserve_name: "",
            //     reserve_name_jkana: "",
            //     tel_num: "09012345678",
            //     mail_addr: "",
            //     reserve_amount: authorization.price,
            //     list_ticket: authorization.seats.map((seat) => {
            //         return {
            //             ticket_code: seat.ticket_code,
            //             std_price: seat.std_price,
            //             add_price: seat.add_price,
            //             dis_price: seat.dis_price,
            //             sale_price: seat.sale_price,
            //             ticket_count: 1,
            //             seat_num: seat.seat_code
            //         }
            //     })
            // });

            let promises = authorization.assets.map(async (asset) => {
                // 資産永続化
                assetRepository.store(asset);
            });

            await Promise.all(promises);
        }
    }
}

export default new StockServiceInterpreter();