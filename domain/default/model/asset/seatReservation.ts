import Asset from "../asset";
import AssetGroup from "../assetGroup";
import Authorization from "../authorization";
import ObjectId from "../objectId";

export default class SeatReservationAsset extends Asset {
    constructor(
        readonly _id: ObjectId,
        readonly price: number,
        readonly authorizations: Array<Authorization>,
        readonly performance: string,
        readonly section: string,
        readonly seat_code: string,
    ) {
        // TODO validation

        super(
            _id,
            AssetGroup.SEAT_RESERVATION,
            price,
            authorizations
        );
    }
}