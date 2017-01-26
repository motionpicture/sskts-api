import AssetAuthorization from "../model/authorization/asset";
import COASeatReservationAuthorization from "../model/authorization/coaSeatReservation";
import AssetRepository from "../repository/asset";
type AssetOperation<T> = (assetRepository: AssetRepository) => Promise<T>;

/**
 * 在庫サービス
 */
interface StockService {
    /** 資産承認解除 */
    unauthorizeAsset(authorization: AssetAuthorization): AssetOperation<void>;
    /** 資産移動 */
    transferAssset(authorization: AssetAuthorization): AssetOperation<void>;

    /** 資産承認解除(COA座席予約) */
    unauthorizeCOASeatReservation(authorization: COASeatReservationAuthorization): Promise<void>;
    /** 資産移動(COA座席予約) */
    transferCOASeatReservation(authorization: COASeatReservationAuthorization): AssetOperation<void>;
}

export default StockService;