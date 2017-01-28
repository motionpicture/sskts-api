"use strict";
const mongoose = require("mongoose");
let schema = new mongoose.Schema({
    group: String,
    authorization: mongoose.Schema.Types.Mixed,
    email: mongoose.Schema.Types.Mixed,
    status: String,
    transaction_id: mongoose.Schema.Types.ObjectId,
    executed_at: Date,
    count_try: Number,
}, {
    collection: "queues",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model("Queue", schema);
