import Asset from "../asset";
import AssetGroup from "../assetGroup";
import Authorization from "../authorization";

export default class SeatReservationAsset extends Asset {
    constructor(
        readonly price: number,
        readonly authorizations: Array<Authorization>,
        readonly performance: string,
        readonly section: string,
        readonly seat_code: string,
    ) {
        // TODO validation

        super(
            `${AssetGroup.SEAT_RESERVATION}_${performance}${section}${seat_code}`,
            AssetGroup.SEAT_RESERVATION,
            price,
            authorizations
        );
    }
}