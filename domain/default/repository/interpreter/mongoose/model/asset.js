"use strict";
const mongoose = require("mongoose");
const owner_1 = require("./owner");
const performance_1 = require("./performance");
let schema = new mongoose.Schema({
    _id: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: owner_1.default.modelName,
        required: true
    },
    authorizations: [
        {
            type: mongoose.Schema.Types.Mixed,
        }
    ],
    group: String,
    price: Number,
    performance: {
        type: String,
        ref: performance_1.default.modelName
    },
    section: String,
    seat_code: String,
}, {
    collection: "assets",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model("Asset", schema);
