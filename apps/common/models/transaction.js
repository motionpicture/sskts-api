"use strict";
const mongoose = require("mongoose");
const OwnerModel = require("./owner");
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
        type: Number,
        required: true,
    },
    owners: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: OwnerModel.default.modelName,
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
exports.default = mongoose.model("Transaction", exports.schema);
