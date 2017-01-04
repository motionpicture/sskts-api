import mongoose = require("mongoose");
import * as AssetModel from "./asset";
import * as OwnerModel from "./owner";
import * as PerformanceModel from "./performance";

/** model name */
export var name = "Authorization";

/**
 * 承認スキーマ
 */
export var schema = new mongoose.Schema({
    owner: { // 所有者
        type: mongoose.Schema.Types.ObjectId,
        ref: OwnerModel.name,
        required: true
    },
    active: { // 有効な承認かどうか
        type: Boolean,
        required: true
    },
    price: { // 価格
        type: Number,
        required: true
    },
    group: { // 承認グループ
        type: String,
        required: true
    },



    /** GROUP_ASSETの場合 */
    asset: {
        type: mongoose.Schema.Types.ObjectId,
        ref: AssetModel.name,
    },






    /** GROUP_COA_SEAT_RESERVATIONの場合 */
    coa_tmp_reserve_num: String, // COA仮予約番号
    performance: {
        type: String,
        ref: PerformanceModel.name,
    },
    section: String, // 座席セクション
    seat_code: String, // 座席コード
    ticket_code: String, // チケットコード
    ticket_name_ja: String, // チケット名
    ticket_name_en: String, // チケット名（英）
    ticket_name_kana: String, // チケット名（カナ）
    std_price: Number, // 標準単価
    add_price: Number, // 加算単価(３Ｄ，ＩＭＡＸ、４ＤＸ等の加算料金)
    dis_price: Number, // 割引額





    /** GROUP_GMOの場合 */
    gmo_shop_pass_string: String, // GMO決済開始時に送信するチェック文字列
    gmo_shop_id: String,
    gmo_amount: String,
    gmo_tax: String,
    gmo_access_id: String,
    gmo_forward: String,
    gmo_method: String,
    gmo_approve: String,
    gmo_tran_id: String,
    gmo_tran_date: String,
    gmo_pay_type: String,
    gmo_cvs_code: String,
    gmo_cvs_conf_no: String,
    gmo_cvs_receipt_no: String,
    gmo_cvs_receipt_url: String,
    gmo_payment_term: String,
    gmo_status: String,



},{
    collection: "authorizations",
    timestamps: { 
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});

// export default mongoose.model(name, schema);

/** 内部資産管理 */
export var GROUP_ASSET = "ASSET";
/** COA座席予約資産管理 */
export var GROUP_COA_SEAT_RESERVATION = "COA_SEAT_RESERVATION";
/** GMO資産管理 */
export var GROUP_GMO = "GMO";
/** ムビチケ資産管理 */
export var GROUP_MVTK = "MVTK";
