import mongoose = require("mongoose");
import * as OwnerModel from "./owner";
import * as AuthorizationModel from "./authorization";

/** model name */
export var name = "Transaction";

/**
 * 取引スキーマ
 */
export var schema = new mongoose.Schema({
    password: String,
    expired_at: Date,
    status: String,
    payment_no: String,
    owners: [{ // 取引の対象所有者リスト
        type: mongoose.Schema.Types.ObjectId,
        ref: OwnerModel.name,
        required: true
    }],
    authorizations: {
        type: [AuthorizationModel.schema],
        // validate: {
        //     validator: function (v) {
        //         console.log(v);
        //         return true;
        //         // return /\d{3}-\d{3}-\d{4}/.test(v);
        //     },
        //     message: '{VALUE} is not a valid phone number!'
        // },
    } // 承認リスト
}, {
    collection: "transactions",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
}).post("validate", function(doc: any) {
    // TODO
    console.log("has been validated (but not saved yet)", doc.authorizations.length);
});

export default mongoose.model(name, schema);

/** 進行中 */
export var STATUS_PROCSSING = "PROCESSING";
/** 成立済み */
export var STATUS_CLOSED = "CLOSED";
/** 期限切れ */
export var STATUS_EXPIRED = "EXPIRED";
