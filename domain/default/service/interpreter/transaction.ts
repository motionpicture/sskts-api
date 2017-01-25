import mongoose = require("mongoose");

import TransactionService from "../transaction";

import Owner from "../../model/owner";
import TransactionEvent from "../../model/transactionEvent";
import TransactionStatus from "../../model/transactionStatus";
import TransactionEventGroup from "../../model/transactionEventGroup";
import Authorization from "../../model/authorization";
import QueueStatus from "../../model/queueStatus";

import AssetAuthorizationRepository from "../../repository/authorization/asset";
import TransactionRepository from "../../repository/transaction";
import OwnerRepository from "../../repository/owner";
import QueueRepository from "../../repository/queue";

import * as AuthorizationFactory from "../../factory/authorization";
import * as TransactionFactory from "../../factory/transaction";
import * as TransactionEventFactory from "../../factory/transactionEvent";
import * as QueueFactory from "../../factory/queue";
import * as EmailFactory from "../../factory/email";

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

            let event = TransactionEventFactory.create({
                _id: mongoose.Types.ObjectId().toString(),
                group: TransactionEventGroup.START,
            });

            let transaction = TransactionFactory.create({
                _id: mongoose.Types.ObjectId().toString(),
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
            let event = TransactionEventFactory.createAuthorize({
                _id: mongoose.Types.ObjectId().toString(),
                authorization: args.authorization,
            });

            // 永続化
            let option = await transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
                status: TransactionStatus.PROCESSING,
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
        owner_id_from: string,
        owner_id_to: string,
        gmo_shop_id: string,
        gmo_shop_pass: string,
        gmo_order_id: string,
        gmo_amount: string,
        gmo_access_id: string,
        gmo_access_pass: string,
        gmo_job_cd: string,
        gmo_pay_type: string,

    }) {
        return async (ownerRepository: OwnerRepository, transactionRepository: TransactionRepository) => {
            let optionTransaction = await transactionRepository.findById(args.transaction_id);
            if (optionTransaction.isEmpty) throw new Error(`transaction[${args.transaction_id}] not found.`);

            let transaction = optionTransaction.get();
            // TODO ObjectIDとStringの問題を解決する
            let ownerIds = transaction.owners.map((owner) => {
                return owner._id.toString();
            });

            if (ownerIds.indexOf(args.owner_id_from) < 0) throw new Error(`transaction[${args.transaction_id}] does not contain a owner[${args.owner_id_from}].`); 
            if (ownerIds.indexOf(args.owner_id_to) < 0) throw new Error(`transaction[${args.transaction_id}] does not contain a owner[${args.owner_id_to}].`); 


            let optionOwnerFrom = await ownerRepository.findById(args.owner_id_from);
            if (optionOwnerFrom.isEmpty) throw new Error(`owner[${args.owner_id_from}] not found.`);

            let optionOwnerTo = await ownerRepository.findById(args.owner_id_to);
            if (optionOwnerTo.isEmpty) throw new Error(`owner[${args.owner_id_to}] not found.`);

            // GMO承認を作成
            let authorization = AuthorizationFactory.createGMO({
                _id: mongoose.Types.ObjectId().toString(),
                order_id: args.gmo_order_id,
                price: parseInt(args.gmo_amount),
                owner_from: optionOwnerFrom.get(),
                owner_to: optionOwnerTo.get(),
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
        owner_id_from: string,
        owner_id_to: string,
        coa_tmp_reserve_num: string,
        price: number,
        seats: Array<{
            performance: string,
            section: string,
            seat_code: string,
            ticket_code: string,
            ticket_name_ja: string,
            ticket_name_en: string,
            ticket_name_kana: string,
            std_price: number,
            add_price: number,
            dis_price: number,
            sale_price: number,
        }>
    }) {
        return async (ownerRepository: OwnerRepository, transactionRepository: TransactionRepository) => {
            let optionTransaction = await transactionRepository.findById(args.transaction_id);
            if (optionTransaction.isEmpty) throw new Error(`transaction[${args.transaction_id}] not found.`);

            let transaction = optionTransaction.get();
            // TODO ObjectIDとStringの問題を解決する
            let ownerIds = transaction.owners.map((owner) => {
                return owner._id.toString();
            });

            if (ownerIds.indexOf(args.owner_id_from) < 0) throw new Error(`transaction[${args.transaction_id}] does not contain a owner[${args.owner_id_from}].`); 
            if (ownerIds.indexOf(args.owner_id_to) < 0) throw new Error(`transaction[${args.transaction_id}] does not contain a owner[${args.owner_id_to}].`); 


            let optionOwnerFrom = await ownerRepository.findById(args.owner_id_from);
            if (optionOwnerFrom.isEmpty) throw new Error(`owner[${args.owner_id_from}] not found.`);

            let optionOwnerTo = await ownerRepository.findById(args.owner_id_to);
            if (optionOwnerTo.isEmpty) throw new Error(`owner[${args.owner_id_to}] not found.`);

            // 承認を作成
            let authorization = AuthorizationFactory.createCOASeatReservation({
                _id: mongoose.Types.ObjectId().toString(),
                coa_tmp_reserve_num: args.coa_tmp_reserve_num,
                price: args.price,
                owner_from: optionOwnerFrom.get(),
                owner_to: optionOwnerTo.get(),
                seats: args.seats
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
            // 取引イベント作成
            let event = TransactionEventFactory.createUnauthorize({
                _id: mongoose.Types.ObjectId().toString(),
                authorization_id: args.authorization_id,
            });

            // 永続化
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
            let event = TransactionEventFactory.create({
                _id: mongoose.Types.ObjectId().toString(),
                group: TransactionEventGroup.EXPIRE,
            });

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

    export function addEmail(args: {
        transaction_id: string,
        from: string,
        to: string,
        subject: string,
        body: string,
    }) {
        return async (transactionRepository: TransactionRepository) => {
            // メールを作成
            let email = EmailFactory.create({
                _id: mongoose.Types.ObjectId().toString(),
                from: args.from,
                to: args.to,
                subject: args.subject,
                body: args.body,
            });

            // 永続化
            let option = await transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
                status: TransactionStatus.PROCESSING
            }, {
                    $set: {
                    },
                    $addToSet: {
                        emails: email,
                    }
                });

            if (option.isEmpty) throw new Error("processing transaction not found.");

            return email;
        }
    }

    export function removeEmail(args: {
        transaction_id: string,
        email_id: string,
    }) {
        return async (transactionRepository: TransactionRepository) => {
            // 永続化
            let option = await transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
                status: TransactionStatus.PROCESSING
            }, {
                    $set: {
                    },
                    $pull: {
                        emails: {
                            _id: args.email_id
                        },
                    }
                });
            if (option.isEmpty) throw new Error("processing transaction not found.");
        }
    }
}

let i: TransactionService = interpreter;
export default i;