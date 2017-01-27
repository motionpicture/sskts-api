import SeatReservationAsset from "../model/asset/seatReservation";
import Authorization from "../model/authorization";

export function createSeatReservation(args: {
    price: number,
    authorizations: Array<Authorization>,
    performance: string,
    section: string,
    seat_code: string,
}) {
    return new SeatReservationAsset(
        args.price,
        args.authorizations,
        args.performance,
        args.section,
        args.seat_code,
    );
}