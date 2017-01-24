import AuthorizationGroup from "../authorizationGroup";
import Authorization from "../authorization";

export default class COASeatReservationAuthorization extends Authorization {
    constructor(
        readonly _id: string,
        readonly coa_tmp_reserve_num: string,
        readonly price: number,
    ) {
        // TODO validation

        super(_id, AuthorizationGroup.COA_SEAT_RESERVATION, price);
    }
}