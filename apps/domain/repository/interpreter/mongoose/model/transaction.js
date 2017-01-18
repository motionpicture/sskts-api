"use strict";
const mongoose = require("mongoose");
const owner_1 = require("./owner");
let schema = new mongoose.Schema({
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
    events: [],
    owners: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: owner_1.default.modelName,
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
exports.default = mongoose.model("Transaction", schema);
