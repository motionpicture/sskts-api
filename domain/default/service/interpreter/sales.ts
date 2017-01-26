import SalesService from "../sales";
// import GMO = require("@motionpicture/gmo-service");
import GMOAuthorization from "../../model/authorization/gmo";

/**
 * 売上サービス
 */
class SalesServiceInterpreter implements SalesService {
    /** GMOオーソリ取消 */
    async cancelGMOAuth(authorization: GMOAuthorization) {
        console.log(authorization);
    };

    /** GMO売上確定 */
    async settleGMOAuth(authorization: GMOAuthorization) {
        console.log(authorization);
    };
}

export default new SalesServiceInterpreter();