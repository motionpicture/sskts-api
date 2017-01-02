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
export function isValid(id: string, password: string, cb: (err: Error, isValid: boolean) => void) {
    // TODO 有効期限確認

    TransactionModel.default.findOne({
        _id: id,
        password: password
    }, "_id", (err, transaction) => {
        if (err) return cb(err, false);
        if (!transaction) return cb(new Error("transaction for a given id and password not found."), false);

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
            _id: id,
            status: TransactionModel.STATUS_PROCSSING,
            // TODO expiredチェック
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
