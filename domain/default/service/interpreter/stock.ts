import StockService from "../stock";
import AssetAuthorization from "../../model/authorization/asset";
import COASeatReservationAuthorization from "../../model/authorization/coaSeatReservation";
import AssetRepository from "../../repository/asset";

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
            console.log(authorization);
            console.log(assetRepository);
        }
    }
}

export default new StockServiceInterpreter();