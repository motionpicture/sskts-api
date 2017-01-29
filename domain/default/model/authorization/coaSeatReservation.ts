import ObjectId from "../objectId";
import AuthorizationGroup from "../authorizationGroup";
import Authorization from "../authorization";
import Owner from "../owner";
import SeatReservationAsset from "../asset/seatReservation";

/**
 * COA座席仮予約
 */
export default class COASeatReservationAuthorization extends Authorization {
    constructor(
        readonly _id: ObjectId,
        readonly coa_tmp_reserve_num: string,
        readonly price: number,
        readonly owner_from: Owner,
        readonly owner_to: Owner,
        /** 資産リスト(COA側では複数座席に対してひとつの仮予約番号が割り当てられるため) */
        readonly assets: Array<SeatReservationAsset>
    ) {
        // TODO validation

        super(_id, AuthorizationGroup.COA_SEAT_RESERVATION, price, owner_from, owner_to);
    }
}