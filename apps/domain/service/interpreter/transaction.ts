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
    export function addGMOAuthorization(id: string, authorization: Authorization.GMO) {
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
    /** COA資産承認 */
    export function addCOAAuthorization(id: string, authorization: Authorization.COA) {
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