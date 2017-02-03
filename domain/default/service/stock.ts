import COASeatReservationAuthorization from "../model/authorization/coaSeatReservation";
import AssetRepository from "../repository/asset";
import COA = require("@motionpicture/coa-service");
type AssetOperation<T> = (assetRepository: AssetRepository) => Promise<T>;
type COAOperation<T> = (coaRepository: typeof COA) => Promise<T>;

/**
 * 在庫サービス
 * 
 * @interface StockService
 */
interface StockService {
    /**
     * COA座席仮予約を解除する
     * 
     * @param {COASeatReservationAuthorization} authorization COA座席予約オーソリ
     */
    unauthorizeCOASeatReservation(authorization: COASeatReservationAuthorization): COAOperation<void>;
    /**
     * COA座席仮予約から資産移動を行う
     * 
     * @param {COASeatReservationAuthorization} authorization COA座席予約オーソリ
     */
    transferCOASeatReservation(authorization: COASeatReservationAuthorization): AssetOperation<void>;
}

export default StockService;