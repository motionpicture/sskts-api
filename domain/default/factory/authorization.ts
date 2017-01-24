import GMOAuthorization from "../model/authorization/gmo";
import COASeatReservationAuthorization from "../model/authorization/coaSeatReservation";

export function createGMO(args: {
    _id: string,
    order_id: string,
    price: number,
}) {
    return new GMOAuthorization(
        args._id,
        args.order_id,
        args.price,
    )
};

export function createCOASeatReservation(args: {
    _id: string,
    coa_tmp_reserve_num: string,
    price: number,
}) {
    return new COASeatReservationAuthorization(
        args._id,
        args.coa_tmp_reserve_num,
        args.price,
    )
};