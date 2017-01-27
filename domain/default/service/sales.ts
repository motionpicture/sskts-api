import GMOAuthorization from "../model/authorization/gmo";
import GMO = require("@motionpicture/gmo-service");

type GMOOperation<T> = (gmoRepository: typeof GMO) => Promise<T>;
/**
 * 売上サービス
 */
interface SalesService {
    /** GMOオーソリ取消 */
    cancelGMOAuth(authorization: GMOAuthorization): GMOOperation<void>;
    /** GMO売上確定 */
    settleGMOAuth(authorization: GMOAuthorization): GMOOperation<void>;
}

export default SalesService;