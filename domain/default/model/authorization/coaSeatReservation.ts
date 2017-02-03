import validator = require("validator");
import ObjectId from "../objectId";
import AuthorizationGroup from "../authorizationGroup";
import Authorization from "../authorization";
import SeatReservationAsset from "../asset/seatReservation";

/**
 * COA座席仮予約
 * 
 * @export
 * @class COASeatReservationAuthorization
 * @extends {Authorization}
 */
export default class COASeatReservationAuthorization extends Authorization {
    /**
     * Creates an instance of COASeatReservationAuthorization.
     * 
     * @param {ObjectId} _id
     * @param {number} coa_tmp_reserve_num
     * @param {string} coa_theater_code
     * @param {string} coa_date_jouei
     * @param {string} coa_title_code
     * @param {string} coa_title_branch_num
     * @param {string} coa_time_begin
     * @param {string} coa_screen_code
     * @param {number} price
     * @param {ObjectId} owner_from
     * @param {ObjectId} owner_to
     * @param {Array<SeatReservationAsset>} assets 資産リスト(COA側では複数座席に対してひとつの仮予約番号が割り当てられるため)
     * 
     * @memberOf COASeatReservationAuthorization
     */
    constructor(
        readonly _id: ObjectId,
        readonly coa_tmp_reserve_num: number,
        readonly coa_theater_code: string,
        readonly coa_date_jouei: string,
        readonly coa_title_code: string,
        readonly coa_title_branch_num: string,
        readonly coa_time_begin: string,
        readonly coa_screen_code: string,
        readonly price: number,
        readonly owner_from: ObjectId,
        readonly owner_to: ObjectId,
        readonly assets: Array<SeatReservationAsset>
    ) {
        super(_id, AuthorizationGroup.COA_SEAT_RESERVATION, price, owner_from, owner_to);

        // TODO validation
        if (validator.isEmpty(coa_tmp_reserve_num.toString())) throw new Error("coa_tmp_reserve_num required.");
        if (validator.isEmpty(coa_theater_code)) throw new Error("coa_theater_code required.");
        if (validator.isEmpty(coa_date_jouei)) throw new Error("coa_date_jouei required.");
        if (validator.isEmpty(coa_title_code)) throw new Error("coa_title_code required.");
        if (validator.isEmpty(coa_title_branch_num)) throw new Error("coa_title_branch_num required.");
        if (validator.isEmpty(coa_time_begin)) throw new Error("coa_time_begin required.");
        if (validator.isEmpty(coa_screen_code)) throw new Error("coa_screen_code required.");
        if (validator.isEmpty(price.toString())) throw new Error("price required.");
        if (validator.isEmpty(owner_from.toString())) throw new Error("owner_from required.");
        if (validator.isEmpty(owner_to.toString())) throw new Error("owner_to required.");
    }
}