"use strict";
const models_1 = require("../../common/models");
const moment = require("moment");
/**
 * 取引アイテムに座席予約を追加する
 */
function create4reservation(args) {
    return new Promise((resolve, reject) => {
        let results = [];
        let promises = args.reservations.map((reservation) => {
            return new Promise((resolve4reservation, reject4reservation) => {
                // TODO 空席状況確認
                // 取引アイテムに座席予約を追加
                models_1.transactionItem.create({
                    transaction: args.transaction_id,
                    category: "Reservation",
                    performance: reservation.performance,
                    seat_code: reservation.seat_code,
                    expired_at: moment().add(+30, 'minutes')
                }).then((transaction) => {
                    results.push({
                        success: true,
                        message: null,
                        performance: transaction.get("performance"),
                        seat_code: transaction.get("seat_code"),
                        transaction_item_id: transaction.get("_id")
                    });
                    resolve4reservation();
                }, (err) => {
                    results.push({
                        success: false,
                        message: err.toString(),
                        performance: reservation.performance,
                        seat_code: reservation.seat_code,
                        transaction_item_id: null
                    });
                    resolve4reservation();
                });
            });
        });
        Promise.all(promises).then(() => {
            resolve(results);
        }, (err) => {
        });
    });
}
exports.create4reservation = create4reservation;
