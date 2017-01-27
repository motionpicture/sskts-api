import Asset from "../asset";
import AssetGroup from "../assetGroup";
import Authorization from "../authorization";
import ObjectId from "../objectId";
import Owner from "../owner";

// TODO 座席予約資産の属性はこれでよいか
export default class SeatReservationAsset extends Asset {
    constructor(
        readonly _id: ObjectId,
        readonly owner: Owner,
        readonly authorizations: Array<Authorization>,
        readonly performance: string,
        readonly section: string,
        readonly seat_code: string,
        readonly ticket_code: string,
        readonly ticket_name_ja: string,
        readonly ticket_name_en: string,
        readonly ticket_name_kana: string,
        readonly std_price: number,
        readonly add_price: number,
        readonly dis_price: number,
        readonly sale_price: number,
    ) {
        // TODO validation

        super(
            _id,
            AssetGroup.SEAT_RESERVATION,
            owner,
            sale_price,
            authorizations
        );
    }
}