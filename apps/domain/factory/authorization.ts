import GMOAuthorization from "../model/authorization/gmo";
import COASeatReservationAuthorization from "../model/authorization/coaSeatReservation";

export function createGMO(args: {
    order_id: string,
    price: number,
}) {
    return new GMOAuthorization(
        `GMOAuthorization_${args.order_id}`, // TODO
        args.order_id,
        args.price,
    )
};

export function createCOASeatReservation(args: {
    coa_tmp_reserve_num: string,
    price: number,
}) {
    return new COASeatReservationAuthorization(
        `COASeatReservationAuthorization_${args.coa_tmp_reserve_num}`, // TODO
        args.coa_tmp_reserve_num,
        args.price,
    )
};