"use strict";
const mongoose = require("mongoose");
exports.schema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: {
            ja: String,
            en: String
        },
        required: true
    },
    name_kana: String,
    address: {
        ja: String,
        en: String
    }
}, {
    collection: "theaters",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model("Theater", exports.schema);
