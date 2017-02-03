import ObjectId from "../objectId";
import AuthorizationGroup from "../authorizationGroup";
import Authorization from "../authorization";

/**
 * GMOオーソリ
 * 
 * @export
 * @class GMOAuthorization
 * @extends {Authorization}
 */
export default class GMOAuthorization extends Authorization {
    /**
     * Creates an instance of GMOAuthorization.
     * 
     * @param {ObjectId} _id
     * @param {number} price
     * @param {ObjectId} owner_from
     * @param {ObjectId} owner_to
     * @param {string} gmo_shop_id
     * @param {string} gmo_shop_pass
     * @param {string} gmo_order_id
     * @param {number} gmo_amount
     * @param {string} gmo_access_id
     * @param {string} gmo_access_pass
     * @param {string} gmo_job_cd
     * @param {string} gmo_pay_type
     * 
     * @memberOf GMOAuthorization
     */
    constructor(
        readonly _id: ObjectId,
        readonly price: number,
        readonly owner_from: ObjectId,
        readonly owner_to: ObjectId,
        readonly gmo_shop_id: string,
        readonly gmo_shop_pass: string,
        readonly gmo_order_id: string,
        readonly gmo_amount: number,
        readonly gmo_access_id: string,
        readonly gmo_access_pass: string,
        readonly gmo_job_cd: string,
        readonly gmo_pay_type: string,
    ) {
        super(_id, AuthorizationGroup.GMO, price, owner_from, owner_to);

        // TODO validation
    }
}