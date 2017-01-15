"use strict";
const mongoose = require("mongoose");
const OwnerModel = require("./owner");
const TransactionModel = require("./transaction");
exports.schema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: OwnerModel.default.modelName,
        required: true
    },
    transactions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: TransactionModel.default.modelName,
        }
    ],
    group: Number,
    price: Number,
}, {
    collection: "assets",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model("Asset", exports.schema);
