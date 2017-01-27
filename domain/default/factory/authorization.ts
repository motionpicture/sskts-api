import GMOAuthorization from "../model/authorization/gmo";
import COASeatReservationAuthorization from "../model/authorization/coaSeatReservation";
import Owner from "../model/owner";

export function createGMO(args: {
    _id: string,
    price: number,
    owner_from: Owner,
    owner_to: Owner,
    gmo_shop_id: string,
    gmo_shop_pass: string,
    gmo_order_id: string,
    gmo_amount: number,
    gmo_access_id: string,
    gmo_access_pass: string,
    gmo_job_cd: string,
    gmo_pay_type: string,
}) {
    return new GMOAuthorization(
        args._id,
        args.price,
        args.owner_from,
        args.owner_to,
        args.gmo_shop_id,
        args.gmo_shop_pass,
        args.gmo_order_id,
        args.gmo_amount,
        args.gmo_access_id,
        args.gmo_access_pass,
        args.gmo_job_cd,
        args.gmo_pay_type,
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