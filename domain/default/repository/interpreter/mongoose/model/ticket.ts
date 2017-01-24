import mongoose = require("mongoose");
import TheaterModel from "./theater";

/**
 * 券種スキーマ
 */
let schema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    theater: {
        type: String,
        ref: TheaterModel.modelName,
        required: true
    },
    code: String, // チケットコード
    name: { // チケット名
        type: {
            ja: String,
            en: String
        },
    },
    name_kana: String, // チケット名(カナ)
},{
    collection: "tickets",
    timestamps: { 
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});

export default mongoose.model("Ticket", schema);
