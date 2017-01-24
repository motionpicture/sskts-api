"use strict";
const mongoose = require("mongoose");
const owner_1 = require("./owner");
let schema = new mongoose.Schema({
    expired_at: Date,
    status: String,
    events: [mongoose.Schema.Types.Mixed],
    owners: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: owner_1.default.modelName,
        }],
    authorizations: [mongoose.Schema.Types.Mixed],
    emails: [mongoose.Schema.Types.Mixed],
    inquiry_id: String,
    inquiry_pass: String,
    queues_imported: Boolean,
}, {
    collection: "transactions",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model("Transaction", schema);
