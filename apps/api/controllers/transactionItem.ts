import {transactionItem as TransactionItemModel} from "../../common/models";
import moment = require("moment");

interface create4reservationArgs {
    transaction_id: string,
    reservations: Array<{
        performance: string,
        seat_code: string
    }>
}
/**
 * 取引アイテムに座席予約を追加する
 */
export function create4reservation(args: create4reservationArgs) {
    interface result {
        /** 取引アイテムに追加できたかどうか */
        success: boolean,
        message: string,
        performance: string,
        seat_code: string,
        /** 取引アイテムID */
        transaction_item_id: string
    }

    return new Promise((resolve: (results: Array<result>) => void, reject: (err: Error) => void) => {
        let results: Array<result> = [];
        let promises = args.reservations.map((reservation) => {
            return new Promise((resolve4reservation, reject4reservation) => {
                // TODO 空席状況確認

                // 取引アイテムに座席予約を追加
                TransactionItemModel.create({
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
                        message: err.toString(), // TODO
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
