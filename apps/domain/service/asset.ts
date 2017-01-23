import AssetAuthorization from "../model/authorization/asset";
import GMOAuthorization from "../model/authorization/gmo";
import COASeatReservationAuthorization from "../model/authorization/coaSeatReservation";
import AssetRepository from "../repository/asset";
type AssetOperation<T> = (assetRepository: AssetRepository) => Promise<T>;

/**
 * 資産サービス
 */
interface AssetService {
    /** 資産承認 */
    authorize(authorization: AssetAuthorization): AssetOperation<void>;
    /** 資産承認解除 */
    unauthorize(authorization: AssetAuthorization): AssetOperation<void>;
    /** 資産移動 */
    transfer(authorization: GMOAuthorization): AssetOperation<void>;

    /** 資産承認解除(GMO) */
    unauthorizeGMO(authorization: GMOAuthorization): Promise<void>;
    /** 資産移動(GMO) */
    transferGMO(authorization: GMOAuthorization): Promise<void>;

    /** 資産承認解除(COA座席予約) */
    unauthorizeCOASeatReservation(authorization: COASeatReservationAuthorization): Promise<void>;
    /** 資産移動(COA座席予約) */
    transferCOASeatReservation(authorization: COASeatReservationAuthorization): AssetOperation<void>;
}

export default AssetService;