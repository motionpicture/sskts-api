import AssetService from "../asset";
import AssetAuthorization from "../../model/authorization/asset";
import GMOAuthorization from "../../model/authorization/gmo";
import COASeatReservationAuthorization from "../../model/authorization/coaSeatReservation";
import AssetRepository from "../../repository/asset";

namespace interpreter {
    /** 資産承認 */
    export function authorize(authorization: AssetAuthorization) {
        return async (assetRepository: AssetRepository) => {
            console.log(authorization);
            console.log(assetRepository);

            // TODO findOneAndUpdateでauthorizationを追加できるかどうか
        }
    }

    /** 資産承認解除 */
    export function unauthorize(authorization: AssetAuthorization) {
        return async (assetRepository: AssetRepository) => {
            console.log(authorization);
            console.log(assetRepository);

            // TODO authorizationの存在を確認して、あれば削除する
        }
    }

    /** 資産移動 */
    export function transfer(authorization: GMOAuthorization) {
        return async (assetRepository: AssetRepository) => {
            console.log(authorization);
            console.log(assetRepository);

            // TODO authorizationの存在を確認して、あれば、所有者等、各属性変更&authorization削除
        }
    }


    /** 資産承認解除(GMO) */
    export async function unauthorizeGMO(authorization: GMOAuthorization) {
        console.log(authorization);

        // TODO GMOのオーソリ取消
    }

    /** 資産移動(GMO) */
    export async function transferGMO(authorization: GMOAuthorization) {
        console.log(authorization);

        // TODO GMO実売り上げ
    }


    /** 資産承認解除(COA座席予約) */
    export async function unauthorizeCOASeatReservation(authorization: COASeatReservationAuthorization) {
        console.log(authorization);

        // TODO COA仮予約削除
    }

    /** 資産移動(COA座席予約) */
    export function transferCOASeatReservation(authorization: COASeatReservationAuthorization) {
        return async (assetRepository: AssetRepository) => {
            console.log(authorization);
            console.log(assetRepository);

            // TODO COA本予約
        }
    }
}

let i: AssetService = interpreter;
export default i;