import StockService from "../stock";
import ObjectId from "../../model/objectId";
import AssetAuthorization from "../../model/authorization/asset";
import COASeatReservationAuthorization from "../../model/authorization/coaSeatReservation";
import AssetRepository from "../../repository/asset";
// import COA = require("@motionpicture/coa-service");

import * as AssetFactory from "../../factory/asset";

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
            //     theater_code: "001", // TODO
            //     date_jouei: "20170131", // TODO
            //     title_code: "8513", // TODO
            //     title_branch_num: "0", // TODO
            //     time_begin: "1010", // TODO
            //     // screen_code: "2",
            //     tmp_reserve_num: authorization.coa_tmp_reserve_num,
            //     reserve_name: "山崎 哲", // TODO
            //     reserve_name_jkana: "ヤマザキ テツ", // TODO
            //     tel_num: "09012345678", // TODO
            //     mail_addr: "yamazaki@motionpicture.jp", // TODO
            //     reserve_amount: authorization.price, // 適当な金額
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

            let promises = authorization.seats.map(async (seat) => {
                // 資産作成
                let asset = AssetFactory.createSeatReservation({
                    _id: ObjectId(),
                    price: authorization.price,
                    authorizations: [],
                    performance: seat.performance,
                    section: seat.section,
                    seat_code: seat.seat_code,
                })

                // 永続化
                assetRepository.store(asset);
            });

            await Promise.all(promises);
        }
    }
}

export default new StockServiceInterpreter();