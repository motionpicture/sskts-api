"use strict";
const mongoose = require("mongoose");
const ownerModel = require("./owner");
const authorizationModel = require("./authorization");
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
    ]
}, {
    collection: 'assets',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});
