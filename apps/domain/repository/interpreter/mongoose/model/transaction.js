"use strict";
const mongoose = require("mongoose");
const owner_1 = require("./owner");
let schema = new mongoose.Schema({
    expired_at: Date,
    status: String,
    events: [],
    owners: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: owner_1.default.modelName,
        }],
    authorizations: [],
    inquiry_id: String,
    inquiry_pass: String,
}, {
    collection: "transactions",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model("Transaction", schema);
