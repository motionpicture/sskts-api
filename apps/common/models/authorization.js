"use strict";
const mongoose = require("mongoose");
const AssetModel = require("./asset");
const OwnerModel = require("./owner");
const PerformanceModel = require("./performance");
const TransactionModel = require("./transaction");
exports.NAME = "Authorization";
exports.schema = new mongoose.Schema({
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: TransactionModel.NAME,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: OwnerModel.NAME,
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
        type: Number,
        required: true,
    },
    process_status: {
        type: Number,
        required: true,
    },
    asset: {
        type: mongoose.Schema.Types.ObjectId,
        ref: AssetModel.NAME,
    },
    coa_tmp_reserve_num: String,
    performance: {
        type: String,
        ref: PerformanceModel.NAME,
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
    gmo_shop_id: String,
    gmo_shop_pass: String,
    gmo_amount: Number,
    gmo_access_id: String,
    gmo_access_pass: String,
    gmo_job_cd: String,
    gmo_tax: Number,
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
}, {
    collection: "authorizations",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});
exports.schema.pre("save", function (next) {
    next();
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model(exports.NAME, exports.schema);
