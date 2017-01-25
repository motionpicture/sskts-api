import AuthorizationGroup from "../authorizationGroup";
import Authorization from "../authorization";
import Owner from "../owner";

export default class COASeatReservationAuthorization extends Authorization {
    constructor(
        readonly _id: string,
        readonly coa_tmp_reserve_num: string,
        readonly price: number,
        readonly owner_from: Owner,
        readonly owner_to: Owner,
        readonly seats: Array<{
            performance: string,
            section: string,
            seat_code: string,
            ticket_code: string,
            ticket_name_ja: string,
            ticket_name_en: string,
            ticket_name_kana: string,
            std_price: number,
            add_price: number,
            dis_price: number,
            sale_price: number,
        }>
    ) {
        // TODO validation

        super(_id, AuthorizationGroup.COA_SEAT_RESERVATION, price, owner_from, owner_to);
    }
}