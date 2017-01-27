import SalesService from "../sales";
import GMO = require("@motionpicture/gmo-service");
import GMOAuthorization from "../../model/authorization/gmo";

/**
 * 売上サービス
 */
class SalesServiceInterpreter implements SalesService {
    /**
     * GMOオーソリ取消
     */
    cancelGMOAuth(authorization: GMOAuthorization) {
        return async (gmoRepository: typeof GMO) => {
            console.log(gmoRepository);
            console.log(authorization);
        }
    };

    /**
     * GMO売上確定
     */
    settleGMOAuth(authorization: GMOAuthorization) {
        return async (gmoRepository: typeof GMO) => {
            await gmoRepository.CreditService.alterTranInterface.call({
                shop_id: authorization.gmo_shop_id,
                shop_pass: authorization.gmo_shop_pass,
                access_id: authorization.gmo_access_id,
                access_pass: authorization.gmo_access_pass,
                job_cd: GMO.Util.JOB_CD_SALES,
                amount: authorization.gmo_amount,
            });
        }
    };
}

export default new SalesServiceInterpreter();