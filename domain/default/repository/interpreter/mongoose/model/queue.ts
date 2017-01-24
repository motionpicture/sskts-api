import mongoose = require("mongoose");

/**
 * キュースキーマ
 */
let schema = new mongoose.Schema({
    _id: String,
    group: String,
    authorization: mongoose.Schema.Types.Mixed,
    email: mongoose.Schema.Types.Mixed,
    status: String,
},{
    collection: "queues",
    timestamps: { 
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});

export default mongoose.model("Queue", schema);