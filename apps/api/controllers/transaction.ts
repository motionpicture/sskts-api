import {transaction as transactionModel} from "../../common/models";
import moment = require("moment");

/**
 * 取引開始
 */
export function create() {
    interface transaction {
        _id: any,
        password: String,
        expired_at: String
    }
    return new Promise((resolve: (result: transaction) => void, reject: (err: Error) => void) => {
        let password = "password"; // TODO パスワード生成方法を決める

        transactionModel.create([{
            password: password,
            expired_at: moment().add(+30, 'minutes')
        }], (err, transactions) => {
            if (err) return reject(err);

            resolve({
                _id: transactions[0].get("_id"),
                password: transactions[0].get("password"),
                expired_at: transactions[0].get("expired_at")
            });
        });
    });
}

/**
 * idとpasswordから取引の有効性確認
 */
export function isValid(id: string, password: string, cb: (err: Error, isValid: boolean) => void) {
    // TODO 有効期限確認

    transactionModel.findOne({
        _id: id,
        password: password
    }, "_id", (err, transaction) => {
        if (err) return cb(err, false);
        if (!transaction) return cb(new Error("transaction for a given id and password not found."), false);

        cb(null, true);
    });
}

/**
 * 購入番号発行
 * 
 * 購入者情報、決済方法関連情報、が必須
 * すでにGMOで与信確保済みであれば取り消してから新たに与信確保
 */
// @Post("/publishPaymentNo")
// publishPaymentNo(@BodyParam("transaction_id") transactionId: string, @BodyParam("transaction_password") transactionPassword: string) {
//     let message: string = null;
//     let moment: typeof momentModule = require("moment");
//     let paymentNo = `${moment().format("YYYYMMDD")}12345` // 購入番号

//     return {
//         success: true,
//         message: message,
//         paymentNo: paymentNo
//     };
// }

/**
 * 取引に対して署名を行う
 */
// @Post("/sign")
// sign() {
//     let message: string = null;

//     return {
//         success: true,
//         message: message
//     };
// }
