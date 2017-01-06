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
function isAvailable(id, password, cb) {
    TransactionModel.default.findOne({
        _id: id,
        password: password,
        status: TransactionModel.STATUS_PROCSSING,
    }, "expired_at", (err, transaction) => {
        if (err)
            return cb(err, false);
        if (!transaction)
            return cb(new Error("transaction for a given id and password not found."), false);
        if (transaction.get("expired_at") <= Date.now())
            return cb(new Error("transaction expired."), false);
        cb(null, true);
    });
}
exports.isAvailable = isAvailable;
/**
 * 取引成立
 */
function close(id) {
    return new Promise((resolve, reject) => {
        TransactionModel.default.findOneAndUpdate({
            _id: id
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
 * 取引更新
 */
function update(args) {
    return new Promise((resolve, reject) => {
        TransactionModel.default.findOneAndUpdate({
            _id: args._id
        }, {
            $set: {
                expired_at: args.expired_at,
                access_id: args.access_id,
                access_pass: args.access_pass,
            }
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
exports.update = update;
