"use strict";
const mongoose = require("mongoose");
const owner_1 = require("./owner");
const transaction_1 = require("./transaction");
let schema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: owner_1.default.modelName,
        required: true
    },
    transactions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: transaction_1.default.modelName,
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
exports.default = mongoose.model("Asset", schema);
