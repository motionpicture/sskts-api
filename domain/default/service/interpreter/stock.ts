import StockService from "../stock";
import AssetAuthorization from "../../model/authorization/asset";
import COASeatReservationAuthorization from "../../model/authorization/coaSeatReservation";
import AssetRepository from "../../repository/asset";
import COA = require("@motionpicture/coa-service");

/**
 * 在庫サービス
 */
class StockServiceInterpreter implements StockService {
    /** 資産承認解除 */
    unauthorizeAsset(authorization: AssetAuthorization) {
        return async (assetRepository: AssetRepository) => {
            console.log(authorization);
            console.log(assetRepository);
            throw new Error("not implemented.");
        }
    }

    /** 資産移動 */
    transferAssset(authorization: AssetAuthorization) {
        return async (assetRepository: AssetRepository) => {
            console.log(authorization);
            console.log(assetRepository);
            throw new Error("not implemented.");
        }
    }

    /** 資産承認解除(COA座席予約) */
    unauthorizeCOASeatReservation(authorization: COASeatReservationAuthorization) {
        return async (coaRepository: typeof COA) => {
            await coaRepository.deleteTmpReserveInterface.call({
                theater_code: authorization.coa_theater_code,
                date_jouei: authorization.coa_date_jouei,
                title_code: authorization.coa_title_code,
                title_branch_num: authorization.coa_title_branch_num,
                time_begin: authorization.coa_time_begin,
                tmp_reserve_num: authorization.coa_tmp_reserve_num,
            });
        }
    }

    /** 資産移動(COA座席予約) */
    transferCOASeatReservation(authorization: COASeatReservationAuthorization) {
        return async (assetRepository: AssetRepository) => {

            // ウェブフロントで事前に本予約済みなので不要
            // await COA.updateReserveInterface.call({
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