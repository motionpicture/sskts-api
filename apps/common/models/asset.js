"use strict";
const mongoose = require("mongoose");
const ownerModel = require("./owner");
const authorizationModel = require("./authorization");
const performanceModel = require("./performance");
/** model name */
exports.name = "Asset";
/**
 * 資産スキーマ
 */
exports.schema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: ownerModel.name,
        required: true
    },
    authorizations: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: authorizationModel.name
        }
    ],
    payment_no: String,
    group: String,
    amount: Number,
    performance: {
        type: String,
        ref: performanceModel.name,
    },
    seat_code: String,
    ticket_type_code: String,
}, {
    collection: 'assets',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model(exports.name, exports.schema);
/** 座席予約グループ */
exports.GROUP_SEAT_RESERVATION = "SEAT_RESERVATION";
