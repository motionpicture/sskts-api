"use strict";
const TransactionModel = require("../../common/models/transaction");
const moment = require("moment");
function find(conditions) {
    // 検索条件を作成
    let andConditions = [
        { _id: { $ne: null } }
    ];
    if (conditions.owner) {
    }
    return new Promise((resolve, reject) => {
        TransactionModel.default.find({ $and: andConditions })
            .lean(true)
            .exec((err, transactions) => {
            if (err)
                return reject(err);
            resolve(transactions);
        });
    });
}
exports.find = find;
/**
 * 取引開始
 */
function create(owners) {
    return new Promise((resolve, reject) => {
        // TODO 所有者IDの存在確認
        let password = "password"; // TODO パスワード生成方法を決める
        TransactionModel.default.create({
            password: password,
            expired_at: moment().add(+30, 'minutes'),
            status: TransactionModel.STATUS_PROCSSING,
            owners: owners
        }).then((transaction) => {
            resolve({
                _id: transaction.get("_id"),
                password: transaction.get("password"),
                expired_at: transaction.get("expired_at"),
                status: transaction.get("status"),
                owners: transaction.get("owners"),
            });
        }, (err) => {
            reject(err);
        });
    });
}
exports.create = create;
/**
 * idとpasswordから取引の有効性確認
 */
function isValid(id, password, cb) {
    // TODO 有効期限確認
    TransactionModel.default.findOne({
        _id: id,
        password: password
    }, "_id", (err, transaction) => {
        if (err)
            return cb(err, false);
        if (!transaction)
            return cb(new Error("transaction for a given id and password not found."), false);
        cb(null, true);
    });
}
exports.isValid = isValid;
/**
 * 取引成立
 */
function close(id) {
    return new Promise((resolve, reject) => {
        TransactionModel.default.findOneAndUpdate({
            _id: id,
            status: TransactionModel.STATUS_PROCSSING,
        }, {
            $set: { status: TransactionModel.STATUS_CLOSED }
        }, {
            new: true,
            upsert: false
        }, ((err, transaction) => {
            if (err)
                return reject(err);
            if (!transaction)
                return reject(new Error("transaction not found."));
            resolve({
                _id: transaction.get("_id"),
                expired_at: transaction.get("expired_at"),
                status: transaction.get("status"),
            });
        }));
    });
}
exports.close = close;
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
