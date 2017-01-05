"use strict";
const mongoose = require("mongoose");
const AssetModel = require("./asset");
const OwnerModel = require("./owner");
const PerformanceModel = require("./performance");
const TransactionModel = require("./transaction");
/** model name */
exports.name = "Authorization";
/**
 * 承認スキーマ
 */
exports.schema = new mongoose.Schema({
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: TransactionModel.name,
        required: true
    },
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
        required: true,
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
exports.schema.pre("save", function (next) {
    switch (this.group) {
        case exports.GROUP_COA_SEAT_RESERVATION:
            if (!this.coa_tmp_reserve_num)
                return next(new Error("coa_tmp_reserve_num required."));
            if (!this.performance)
                return next(new Error("performance required."));
            if (!this.section)
                return next(new Error("section required."));
            if (!this.seat_code)
                return next(new Error("seat_code required."));
            if (!this.ticket_code)
                return next(new Error("ticket_code required."));
            if (!this.ticket_name_ja)
                return next(new Error("ticket_name_ja required."));
            // if (!this.ticket_name_en) return next(new Error("ticket_name_en required."));
            // if (!this.ticket_name_kana) return next(new Error("ticket_name_kana required."));
            if (this.std_price !== 0 && !this.std_price)
                return next(new Error("std_price required."));
            if (this.add_price !== 0 && !this.add_price)
                return next(new Error("add_price required."));
            if (this.dis_price !== 0 && !this.dis_price)
                return next(new Error("dis_price required."));
            break;
        default:
            break;
    }
    next();
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model(exports.name, exports.schema);
/** 内部資産管理 */
exports.GROUP_ASSET = "ASSET";
/** COA座席予約資産管理 */
exports.GROUP_COA_SEAT_RESERVATION = "COA_SEAT_RESERVATION";
/** GMO資産管理 */
exports.GROUP_GMO = "GMO";
/** ムビチケ資産管理 */
exports.GROUP_MVTK = "MVTK";
