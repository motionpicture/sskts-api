import GMOAuthorization from "../model/authorization/gmo";

/**
 * 売上サービス
 */
interface SalesService {
    /** GMOオーソリ取消 */
    cancelGMOAuth(authorization: GMOAuthorization): Promise<void>;
    /** GMO売上確定 */
    settleGMOAuth(authorization: GMOAuthorization): Promise<void>;
}

export default SalesService;