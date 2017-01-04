import mongoose = require("mongoose");
import * as AssetModel from "./asset";
import * as OwnerModel from "./owner";

/** model name */
export var name = "Authorization";

/**
 * 承認スキーマ
 */
export var schema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: OwnerModel.name,
        required: true
    },
    active: Boolean,
    price: Number,
    group: {
        type: String,
        required: true
    },



    /** asset管理の場合 */
    asset: {
        type: mongoose.Schema.Types.ObjectId,
        ref: AssetModel.name,
    },



    /** COA資産管理の場合 */
    coa_tmp_reserve_num: String, // COA仮予約番号



    /** GMO資産管理の場合 */
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

export var GROUP_ASSET = "ASSET";
export var GROUP_GMO = "GMO";
