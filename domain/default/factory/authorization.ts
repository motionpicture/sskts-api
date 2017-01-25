import GMOAuthorization from "../model/authorization/gmo";
import COASeatReservationAuthorization from "../model/authorization/coaSeatReservation";
import Owner from "../model/owner";

export function createGMO(args: {
    _id: string,
    order_id: string,
    price: number,
    owner_from: Owner,
    owner_to: Owner,
}) {
    return new GMOAuthorization(
        args._id,
        args.order_id,
        args.price,
        args.owner_from,
        args.owner_to,
    )
};

export function createCOASeatReservation(args: {
    _id: string,
    coa_tmp_reserve_num: string,
    price: number,
    owner_from: Owner,
    owner_to: Owner,
    seats: Array<{
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
}) {
    return new COASeatReservationAuthorization(
        args._id,
        args.coa_tmp_reserve_num,
        args.price,
        args.owner_from,
        args.owner_to,
        args.seats
    )
};