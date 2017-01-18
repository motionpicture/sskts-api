import mongoose = require("mongoose");
import Owner from "../../model/Owner";
import Transaction from "../../model/Transaction";
import TransactionEvent from "../../model/TransactionEvent";
import TransactionEventGroup from "../../model/TransactionEventGroup";
import TransactionStatus from "../../model/TransactionStatus";
import * as Authorization from "../../model/Authorization";
import TransactionService from "../transaction";
import TransactionRepository from "../../repository/transaction";
import OwnerRepository from "../../repository/owner";

namespace interpreter {
    /** 取引開始 */
    export function start(expired_at: Date, ownerIds: Array<string>) {
        return async (ownerRepository: OwnerRepository, transactionRepository: TransactionRepository) => {
            let owners: Array<Owner> = [];
            let promises = ownerIds.map(async (ownerId) => {
                let option = await ownerRepository.findById(ownerId);
                if (option.isEmpty) throw new Error("owner not found.");
                owners.push(option.get());
            });
            await Promise.all(promises);

            let event = new TransactionEvent(
                mongoose.Types.ObjectId().toString(),
                TransactionEventGroup.START,
                null
            );

            let transaction = new Transaction(
                mongoose.Types.ObjectId().toString(),
                "password", // TODO
                TransactionStatus.PROCESSING,
                [event],
                owners,
                expired_at,
                "",
                "",
            );

            await transactionRepository.store(transaction);

            return transaction;
        }
    }

    function pushEvent(args: {
        transaction_id: string,
        transaction_password: string,
        event: TransactionEvent
    }) {
        return async (transactionRepository: TransactionRepository) => {
            // 永続化
            let option = await transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
                password: args.transaction_password,
                status: TransactionStatus.PROCESSING
            }, {
                    $set: {
                    },
                    $push: {
                        events: args.event
                    }
                });
            if (option.isEmpty) throw new Error("processing transaction with given password not found.");
        }
    }

    /** 内部資産承認 */
    export function addAssetAuthorization(id: string, authorization: Authorization.ASSET) {
        return async (transactionRepository: TransactionRepository) => {
            let event = new TransactionEvent(
                mongoose.Types.ObjectId().toString(),
                TransactionEventGroup.START,
                authorization
            );

            let option = await transactionRepository.findOneAndUpdate({
                _id: id,
                status: TransactionStatus.PROCESSING
            }, {
                    $set: {
                    },
                    $push: {
                        events: event
                    }
                });
            if (option.isEmpty) throw new Error("processing transaction not found.");
        }
    }

    /** GMO資産承認 */
    export function addGMOAuthorization(args: {
        transaction_id: string,
        transaction_password: string,
        owner_id: string,
        gmo_shop_id: string,
        gmo_shop_password: string,
        gmo_order_id: string,
        gmo_amount: string,
        gmo_access_id: string,
        gmo_access_password: string,
        gmo_job_cd: string,
        gmo_pay_type: string,

    }) {
        return async (transactionRepository: TransactionRepository) => {
            // TODO 所有者チェック

            // GMO承認を作成
            let authorization = new Authorization.GMO(
                mongoose.Types.ObjectId().toString(),
                args.gmo_order_id
            );

            // 取引イベント作成
            let event = new TransactionEvent(
                mongoose.Types.ObjectId().toString(),
                TransactionEventGroup.AUTHORIZE,
                authorization
            );

            // 永続化
            await pushEvent({
                transaction_id: args.transaction_id,
                transaction_password: args.transaction_password,
                event: event
            })(transactionRepository);
        }
    }

    /** COA資産承認 */
    export function addCOAAuthorization(args: {
        transaction_id: string,
        transaction_password: string,
        owner_id: string,
        coa_tmp_reserve_num: string,
        seats: Array<{
            performance: string,
            section: string,
            seat_code: string,
            ticket_code: string,
            // ticket_name_ja: string,
            // ticket_name_en: string,
            // ticket_name_kana: string,
            // std_price: number,
            // add_price: number,
            // dis_price: number,
        }>
        // price: number,
    }) {
        return async (transactionRepository: TransactionRepository) => {
            // TODO 所有者チェック

            // GMO承認を作成
            let authorization = new Authorization.COA(
                mongoose.Types.ObjectId().toString(),
                args.coa_tmp_reserve_num
            );

            // 取引イベント作成
            let event = new TransactionEvent(
                mongoose.Types.ObjectId().toString(),
                TransactionEventGroup.AUTHORIZE,
                authorization
            );

            // 永続化
            await pushEvent({
                transaction_id: args.transaction_id,
                transaction_password: args.transaction_password,
                event: event
            })(transactionRepository);
        }
    }
    /** 資産承認解除 */
    // unauthorizeAsset(id: string): AssetAndTransactionOperation<void>;
    /** 取引成立 */
    export function close(id: string) {
        return async (transactionRepository: TransactionRepository) => {
            let event = new TransactionEvent(
                mongoose.Types.ObjectId().toString(),
                TransactionEventGroup.CLOSE,
                null
            );

            let option = await transactionRepository.findOneAndUpdate({
                _id: id,
                status: TransactionStatus.PROCESSING
            }, {
                    $set: {
                        status: TransactionStatus.CLOSED
                    },
                    $push: {
                        events: event
                    }
                });
            if (option.isEmpty) throw new Error("processing transaction not found.");
        }
    }
    /** 取引期限切れ */
    export function expire(id: string) {
        return async (transactionRepository: TransactionRepository) => {
            let event = new TransactionEvent(
                mongoose.Types.ObjectId().toString(),
                TransactionEventGroup.EXPIRE,
                null
            );

            let option = await transactionRepository.findOneAndUpdate({
                _id: id,
                status: TransactionStatus.PROCESSING
            }, {
                    $set: {
                        status: TransactionStatus.EXPIRED
                    },
                    $push: {
                        events: event
                    }
                });
            if (option.isEmpty) throw new Error("processing transaction not found.");
        }
    }
    /** 取引取消 */
    export function cancel(id: string) {
        return async (transactionRepository: TransactionRepository) => {
            let event = new TransactionEvent(
                mongoose.Types.ObjectId().toString(),
                TransactionEventGroup.CANCEL,
                null
            );

            let option = await transactionRepository.findOneAndUpdate({
                _id: id,
                status: TransactionStatus.CLOSED
            }, {
                    $set: {
                        status: TransactionStatus.CANCELED
                    },
                    $push: {
                        events: event
                    }
                });
            if (option.isEmpty) throw new Error("closed transaction not found.");
        }
    }
}

let i: TransactionService = interpreter;
export default i;