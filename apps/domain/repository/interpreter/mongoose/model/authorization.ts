import mongoose = require("mongoose");
import AssetModel from "./asset";
import OwnerModel from "./owner";
import PerformanceModel from "./performance";
import TransactionModel from "./transaction";

/**
 * 承認スキーマ
 */
let schema = new mongoose.Schema({
    transaction: { // 取引
        type: mongoose.Schema.Types.ObjectId,
        ref: TransactionModel.modelName,
        required: true
    },
    owner: { // 所有者
        type: mongoose.Schema.Types.ObjectId,
        ref: OwnerModel.modelName,
        required: true
    },
    active: { // 有効な承認かどうか
        type: Boolean,
        required: true
    },
    price: { // 価格
        type: Number,
        required: true
    },
    group: { // 承認グループ
        type: String,
        required: true,
    },
    process_status: { // TODO 処理ステータス管理
        type: Number,
        required: true,
    },



    /** GROUP_ASSETの場合 */
    asset: {
        type: mongoose.Schema.Types.ObjectId,
        ref: AssetModel.modelName,
    },






    /** GROUP_COA_SEAT_RESERVATIONの場合 */
    coa_tmp_reserve_num: String, // COA仮予約番号
    performance: {
        type: String,
        ref: PerformanceModel.modelName,
    },
    section: String, // 座席セクション
    seat_code: String, // 座席コード
    ticket_code: String, // チケットコード
    ticket_name_ja: String, // チケット名
    ticket_name_en: String, // チケット名（英）
    ticket_name_kana: String, // チケット名（カナ）
    std_price: Number, // 標準単価
    add_price: Number, // 加算単価(３Ｄ，ＩＭＡＸ、４ＤＸ等の加算料金)
    dis_price: Number, // 割引額





    /** GROUP_GMOの場合 */
    gmo_shop_id: String,
    gmo_shop_pass: String,
    gmo_amount: Number,
    gmo_access_id: String,
    gmo_access_pass: String,
    gmo_job_cd: String,
    gmo_tax: Number,
    gmo_forward: String,
    gmo_method: String,
    gmo_approve: String,
    gmo_tran_id: String,
    gmo_tran_date: String,
    gmo_pay_type: String,
    gmo_cvs_code: String,
    gmo_cvs_conf_no: String,
    gmo_cvs_receipt_no: String,
    gmo_cvs_receipt_url: String,
    gmo_payment_term: String,



},{
    collection: "authorizations",
    timestamps: { 
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});

schema.pre("save", function(this: any, next){
    // TODO どこかにバリデーション移行
    // switch (this.group) {
    //     case GROUP.COA_SEAT_RESERVATION:
    //         if (!this.coa_tmp_reserve_num) return next(new Error("coa_tmp_reserve_num required."));
    //         if (!this.performance) return next(new Error("performance required."));
    //         if (!this.section) return next(new Error("section required."));
    //         if (!this.seat_code) return next(new Error("seat_code required."));
    //         if (!this.ticket_code) return next(new Error("ticket_code required."));
    //         if (!this.ticket_name_ja) return next(new Error("ticket_name_ja required."));
    //         // if (!this.ticket_name_en) return next(new Error("ticket_name_en required."));
    //         // if (!this.ticket_name_kana) return next(new Error("ticket_name_kana required."));
    //         if (this.std_price !== 0 && !this.std_price) return next(new Error("std_price required."));
    //         if (this.add_price !== 0 && !this.add_price) return next(new Error("add_price required."));
    //         if (this.dis_price !== 0 && !this.dis_price) return next(new Error("dis_price required."));

    //         break;
    //     case GROUP.GMO:
    //         if (!this.gmo_shop_id) return next(new Error("gmo_shop_id required."));
    //         if (!this.gmo_shop_pass) return next(new Error("gmo_shop_pass required."));
    //         if (!this.gmo_access_id) return next(new Error("gmo_access_id required."));
    //         if (!this.gmo_access_pass) return next(new Error("gmo_access_pass required."));
    //         if (this.gmo_amount !== 0 && !this.gmo_amount) return next(new Error("gmo_amount required."));

    //         break;
    //     default:
    //         break;
    // }

    next();
});

export default mongoose.model("Authorization", schema);
