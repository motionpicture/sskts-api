"use strict";
const mongoose = require("mongoose");
const AssetModel = require("./asset");
const OwnerModel = require("./owner");
const PerformanceModel = require("./performance");
/** model name */
exports.name = "Authorization";
/**
 * 承認スキーマ
 */
exports.schema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: OwnerModel.name,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    group: {
        type: String,
        required: true
    },
    /** GROUP_ASSETの場合 */
    asset: {
        type: mongoose.Schema.Types.ObjectId,
        ref: AssetModel.name,
    },
    /** GROUP_COA_SEAT_RESERVATIONの場合 */
    coa_tmp_reserve_num: String,
    performance: {
        type: String,
        ref: PerformanceModel.name,
    },
    section: String,
    seat_code: String,
    ticket_code: String,
    ticket_name_ja: String,
    ticket_name_en: String,
    ticket_name_kana: String,
    std_price: Number,
    add_price: Number,
    dis_price: Number,
    /** GROUP_GMOの場合 */
    gmo_shop_pass_string: String,
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
}, {
    collection: "authorizations",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});
// export default mongoose.model(name, schema);
/** 内部資産管理 */
exports.GROUP_ASSET = "ASSET";
/** COA座席予約資産管理 */
exports.GROUP_COA_SEAT_RESERVATION = "COA_SEAT_RESERVATION";
/** GMO資産管理 */
exports.GROUP_GMO = "GMO";
/** ムビチケ資産管理 */
exports.GROUP_MVTK = "MVTK";
