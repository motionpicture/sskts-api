"use strict";
const mongoose = require("mongoose");
const OwnerModel = require("./owner");
exports.name = "Transaction";
exports.schema = new mongoose.Schema({
    password: {
        type: String,
        required: true,
    },
    expired_at: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    owners: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: OwnerModel.name,
            required: true
        }],
    access_id: String,
    access_pass: String,
}, {
    collection: "transactions",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model(exports.name, exports.schema);
exports.STATUS_PROCSSING = "PROCESSING";
exports.STATUS_CLOSED = "CLOSED";
exports.STATUS_EXPIRED = "EXPIRED";
exports.STATUS_CANCELED = "CANCELED";
