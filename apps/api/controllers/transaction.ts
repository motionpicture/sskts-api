import * as TransactionModel from "../../common/models/transaction";
import moment = require("moment");

/**
 * 取引検索
 */
interface conditions {
    owner?: string,
}
export function find(conditions: conditions) {
    interface transaction {
        _id: string,
        password: string,
        expired_at: Date,
        status: string,
    }


    // 検索条件を作成
    let andConditions: Array<Object> = [
        {_id: {$ne: null}}
    ];

    if (conditions.owner) {
    }

    return new Promise((resolve: (result: Array<transaction>) => void, reject: (err: Error) => void) => {
        TransactionModel.default.find({$and: andConditions})
        .lean(true)
        .exec((err, transactions: Array<transaction>) => {
            if (err) return reject(err);

            resolve(transactions);
        })
    });
}

/**
 * 取引開始
 */
export function create(owners: Array<string>) {
    interface transaction {
        _id: string,
        password: string,
        expired_at: string,
        status: string,
        owners: Array<string>
    }
    return new Promise((resolve: (result: transaction) => void, reject: (err: Error) => void) => {
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

/**
 * idとpasswordから取引の有効性確認
 */
export function isAvailable(id: string, password: string, cb: (err: Error, isValid: boolean) => void) {
    TransactionModel.default.findOne({
        _id: id,
        password: password,
        status: TransactionModel.STATUS_PROCSSING,
    }, "expired_at", (err, transaction) => {
        if (err) return cb(err, false);
        if (!transaction) return cb(new Error("transaction for a given id and password not found."), false);
        if (transaction.get("expired_at") <= Date.now()) return cb(new Error("transaction expired."), false);

        cb(null, true);
    });
}

/**
 * 取引成立
 */
export function close(id: string) {
    interface transaction {
        _id: string,
        expired_at: string,
        status: string,
    }
    return new Promise((resolve: (result: transaction) => void, reject: (err: Error) => void) => {
        TransactionModel.default.findOneAndUpdate({
            _id: id
        }, {
            $set: {status: TransactionModel.STATUS_CLOSED}
        }, {
            new: true,
            upsert: false
        }, ((err, transaction) => {
            if (err) return reject(err);
            if (!transaction) return reject(new Error("transaction not found."));

            resolve({
                _id: transaction.get("_id"),
                expired_at: transaction.get("expired_at"),
                status: transaction.get("status"),
            });
        }));
    });
}

/**
 * 購入番号発行
 */
export function publishPaymentNo(id: string) {
    return new Promise((resolve: (result: string) => void, reject: (err: Error) => void) => {
        // COA本予約で購入番号取得
        // 取引に番号を登録
        TransactionModel.default.findOneAndUpdate({
            _id: id,
        }, {
            $set: {payment_no: "12345"}
        }, {
            new: true,
            upsert: false
        }, ((err, transaction) => {
            if (err) return reject(err);
            if (!transaction) return reject(new Error("transaction not found."));

            resolve("12345");
        }));
    });
}
