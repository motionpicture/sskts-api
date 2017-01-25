import mongoose = require("mongoose");

import TransactionService from "../transaction";

import Owner from "../../model/owner";
import TransactionEvent from "../../model/transactionEvent";
import TransactionStatus from "../../model/transactionStatus";
import AuthorizeTransactionEvent from "../../model/transactionEvent/authorize";
import UnauthorizeTransactionEvent from "../../model/transactionEvent/unauthorize";
import TransactionEventGroup from "../../model/transactionEventGroup";
import Authorization from "../../model/authorization";
import QueueStatus from "../../model/queueStatus";

import AssetAuthorizationRepository from "../../repository/authorization/asset";
import TransactionRepository from "../../repository/transaction";
import OwnerRepository from "../../repository/owner";
import QueueRepository from "../../repository/queue";

import * as AuthorizationFactory from "../../factory/authorization";
import * as TransactionFactory from "../../factory/transaction";
import * as QueueFactory from "../../factory/queue";

namespace interpreter {
    export function getDetails(args: {
        transaction_id: string,
    }) {
        return async (transactionRepository: TransactionRepository) => {
            return await transactionRepository.findById(args.transaction_id);
        };
    }
    /** 取引開始 */
    export function start(args: {
        expired_at: Date,
        owner_ids: Array<string>
    }) {
        return async (ownerRepository: OwnerRepository, transactionRepository: TransactionRepository) => {
            let owners: Array<Owner> = [];
            let promises = args.owner_ids.map(async (ownerId) => {
                let option = await ownerRepository.findById(ownerId);
                if (option.isEmpty) throw new Error("owner not found.");
                owners.push(option.get());
            });
            await Promise.all(promises);

            let event = new TransactionEvent(
                mongoose.Types.ObjectId().toString(),
                TransactionEventGroup.START,
            );

            let transaction = TransactionFactory.create({
                _id: mongoose.Types.ObjectId().toString(), // TODO どちらで指定？
                status: TransactionStatus.PROCESSING,
                events: [event],
                owners: owners,
                expired_at: args.expired_at
            });

            await transactionRepository.store(transaction);

            return transaction;
        }
    }

    function pushAuthorization(args: {
        transaction_id: string,
        authorization: Authorization
    }) {
        return async (transactionRepository: TransactionRepository) => {
            // 取引イベント作成
            let event = new AuthorizeTransactionEvent(
                mongoose.Types.ObjectId().toString(),
                args.authorization
            );

            // 永続化
            // TODO idempotent?
            let option = await transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
                status: TransactionStatus.PROCESSING
            }, {
                    $set: {
                    },
                    $push: {
                        events: event,
                    },
                    $addToSet: {
                        authorizations: args.authorization,
                    }
                });

            if (option.isEmpty) throw new Error("processing transaction not found.");
        }
    }

    /** 内部資産承認 */
    export function addAssetAuthorization(args: {
        transaction_id: string,
        authorization_id: string,
    }) {
        return async (assetAuthorizationRepository: AssetAuthorizationRepository, transactionRepository: TransactionRepository) => {
            // GMO承認を作成
            let option = await assetAuthorizationRepository.findById(args.authorization_id);
            if (option.isEmpty) throw new Error("authorization not found.");

            // 永続化
            await pushAuthorization({
                transaction_id: args.transaction_id,
                authorization: option.get()
            })(transactionRepository);

            return option.get();
        }
    }

    /** GMO資産承認 */
    export function addGMOAuthorization(args: {
        transaction_id: string,
        owner_id: string,
        gmo_shop_id: string,
        gmo_shop_pass: string,
        gmo_order_id: string,
        gmo_amount: string,
        gmo_access_id: string,
        gmo_access_pass: string,
        gmo_job_cd: string,
        gmo_pay_type: string,

    }) {
        return async (transactionRepository: TransactionRepository) => {
            // TODO 所有者チェック

            // GMO承認を作成
            let authorization = AuthorizationFactory.createGMO({
                _id: mongoose.Types.ObjectId().toString(),
                order_id: args.gmo_order_id,
                price: parseInt(args.gmo_amount) // TODO
            });

            // 永続化
            await pushAuthorization({
                transaction_id: args.transaction_id,
                authorization: authorization
            })(transactionRepository);

            return authorization;
        }
    }

    /** COA資産承認 */
    export function addCOASeatReservationAuthorization(args: {
        transaction_id: string,
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

            // 承認を作成
            let authorization = AuthorizationFactory.createCOASeatReservation({
                _id: mongoose.Types.ObjectId().toString(),
                coa_tmp_reserve_num: args.coa_tmp_reserve_num,
                price: 1234 // TODO
            });

            // 永続化
            await pushAuthorization({
                transaction_id: args.transaction_id,
                authorization: authorization
            })(transactionRepository);

            return authorization;
        }
    }

    /** 資産承認解除 */
    export function removeAuthorization(args: {
        transaction_id: string,
        authorization_id: string,
    }) {
        return async (transactionRepository: TransactionRepository) => {
            // TODO 承認存在チェック

            // TODO 承認あれば、そのグループに応じて削除する？

            // 取引イベント作成
            let event = new UnauthorizeTransactionEvent(
                mongoose.Types.ObjectId().toString(),
                args.authorization_id
            );

            // 永続化
            // TODO idempotent?
            let option = await transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
                status: TransactionStatus.PROCESSING
            }, {
                    $set: {
                    },
                    $push: {
                        events: event,
                    },
                    $pull: {
                        authorizations: {
                            _id: args.authorization_id
                        },
                    }
                });
            if (option.isEmpty) throw new Error("processing transaction not found.");
        }
    }

    /** 照合を可能にする */
    export function enableInquiry(args: {
        transaction_id: string,
        inquiry_id: string,
        inquiry_pass: string,
    }) {
        return async (transactionRepository: TransactionRepository) => {
            let option = await transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
                status: TransactionStatus.PROCESSING
            }, {
                    $set: {
                        inquiry_id: args.inquiry_id,
                        inquiry_pass: args.inquiry_pass,
                    },
                });
            if (option.isEmpty) throw new Error("processing transaction not found.");
        };
    }

    /** 取引成立 */
    export function close(args: {
        transaction_id: string
    }) {
        return async (transactionRepository: TransactionRepository) => {
            let event = new TransactionEvent(
                mongoose.Types.ObjectId().toString(),
                TransactionEventGroup.CLOSE,
            );

            // TODO キューリストを事前作成する

            let option = await transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
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
    export function expire(args: {
        transaction_id: string
    }) {
        return async (transactionRepository: TransactionRepository) => {
            let event = new TransactionEvent(
                mongoose.Types.ObjectId().toString(),
                TransactionEventGroup.EXPIRE,
            );

            // TODO キューリストを事前作成する

            let option = await transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
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
    export function cancel(args: {
        transaction_id: string
    }) {
        return async (transactionRepository: TransactionRepository) => {
            let event = new TransactionEvent(
                mongoose.Types.ObjectId().toString(),
                TransactionEventGroup.CANCEL,
            );

            // TODO キューリストを事前作成する

            let option = await transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
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

    /** キュー出力 */
    export function enqueue() {
        return async (transactionRepository: TransactionRepository, queueRepository: QueueRepository) => {
            // 未インポートの取引を取得
            let option = await transactionRepository.findOneAndUpdate({
                status: { $in: [TransactionStatus.CLOSED, TransactionStatus.EXPIRED] },
                queues_imported: false
            }, {
                    queues_imported: false
                });
            if (option.isEmpty) return;

            let transaction = option.get();
            console.log("transaction is", transaction);

            let promises: Array<Promise<void>> = [];
            switch (transaction.status) {
                case TransactionStatus.CLOSED:
                    // 資産移動キュー作成
                    promises = promises.concat(transaction.authorizations.map(async (authorization) => {
                        let queue = QueueFactory.createSettleAuthorization({
                            status: QueueStatus.UNEXECUTED,
                            executed_at: new Date(), // TODO いつ実行？
                            count_try: 0,
                            authorization: authorization
                        });
                        await queueRepository.store(queue);
                    }));

                    // TODO メール送信キュー作成

                    break;

                case TransactionStatus.EXPIRED:
                    // 承認解除キュー作成
                    // promises = promises.concat(transaction.authorizations.map(async (authorization) => {
                    //     let queue = QueueFactory.createSetttleAuthorization({
                    //         authorization: authorization
                    //     });
                    //     await queueRepository.store(queue);
                    // }));

                    break;
                default:
                    break;
            }

            await Promise.all(promises);
            console.log("queues created.");

            // 承認を全て作成できたら取引のフラグ変更
            await transactionRepository.findOneAndUpdate({
                _id: transaction._id
            }, {
                    queues_imported: true
                });
        }
    }
}

let i: TransactionService = interpreter;
export default i;