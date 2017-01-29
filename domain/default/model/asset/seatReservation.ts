import Asset from "../asset";
import AssetGroup from "../assetGroup";
import Authorization from "../authorization";
import ObjectId from "../objectId";
import Ownership from "../ownership";

// TODO 座席予約資産の属性はこれでよいか
export default class SeatReservationAsset extends Asset {
    constructor(
        readonly _id: ObjectId,
        /** 所有権 */
        readonly ownership: Ownership,
        /** 承認リスト */
        readonly authorizations: Array<Authorization>,
        /** パフォーマンス */
        readonly performance: string,
        /** スクリーンセクション */
        readonly section: string,
        /** 座席コード */
        readonly seat_code: string,
        /** 券種コード */
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
            ownership,
            sale_price,
            authorizations
        );
    }
}