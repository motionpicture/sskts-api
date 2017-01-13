"use strict";
const mongoose = require("mongoose");
exports.NAME = "Owner";
exports.schema = new mongoose.Schema({
    name: {
        ja: String,
        en: String
    },
    group: Number,
    email: String,
    tel: String,
}, {
    collection: "owners",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model(exports.NAME, exports.schema);
