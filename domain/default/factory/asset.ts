import SeatReservationAsset from "../model/asset/seatReservation";
import Authorization from "../model/authorization";
import ObjectId from "../model/objectId";

export function createSeatReservation(args: {
    _id: ObjectId,
    price: number,
    authorizations: Array<Authorization>,
    performance: string,
    section: string,
    seat_code: string,
}) {
    return new SeatReservationAsset(
        args._id,
        args.price,
        args.authorizations,
        args.performance,
        args.section,
        args.seat_code,
    );
}