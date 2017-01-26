import mongoose = require("mongoose");
import monapt = require("monapt");

import TransactionService from "../transaction";

import Owner from "../../model/owner";
import TransactionEvent from "../../model/transactionEvent";
import TransactionStatus from "../../model/transactionStatus";
import TransactionEventGroup from "../../model/transactionEventGroup";
import Authorization from "../../model/authorization";
import Queue from "../../model/queue";
import QueueStatus from "../../model/queueStatus";
import AssetAuthorization from "../../model/authorization/asset";

import AssetRepository from "../../repository/asset";
import AssetAuthorizationRepository from "../../repository/authorization/asset";
import TransactionRepository from "../../repository/transaction";
import OwnerRepository from "../../repository/owner";
import QueueRepository from "../../repository/queue";
import AdministratorOwnerRepository from "../../repository/owner/administrator";

import * as AuthorizationFactory from "../../factory/authorization";
import * as TransactionFactory from "../../factory/transaction";
import * as TransactionEventFactory from "../../factory/transactionEvent";
import * as QueueFactory from "../../factory/queue";
import * as EmailFactory from "../../factory/email";
import * as OwnerFactory from "../../factory/owner";

class TransactionServiceInterpreter implements TransactionService {
    /**
     * 匿名所有者作成
     */
    createAnonymousOwner() {
        return async (repository: OwnerRepository) => {
            let owner = OwnerFactory.createAnonymous({
                _id: mongoose.Types.ObjectId().toString()
            });

            // 永続化
            await repository.store(owner);
            return owner;
        };
    }

    /**
     * 匿名所有者更新
     */
    updateAnonymousOwner(args: {
        _id: string,
        name_first?: string,
        name_last?: string,
        email?: string,
        tel?: string,
    }) {
        return async (repository: OwnerRepository) => {
            // 永続化
            let option = await repository.findOneAndUpdate({
                _id: args._id,
            }, {
                    $set: {
                        name_first: args.name_first,
                        name_last: args.name_last,
                        email: args.email,
                        tel: args.tel,
                    }
                });
            if (option.isEmpty) throw new Error("owner not found.");
        };
    }

    /**
     * 運営者を取得する
     */
    getAdministratorOwner() {
        return async (repository: AdministratorOwnerRepository) => {
            // 運営者取得
            let option = await repository.findOne();
            if (option.isEmpty) throw new Error("administrator owner not found.");

            return option.get();
        };
    }

    /**
     * IDから取得する
     */
    findById(args: {
        transaction_id: string,
    }) {
        return async (transactionRepository: TransactionRepository) => {
            return await transactionRepository.findById(args.transaction_id);
        };
    }

    /**
     * 取引開始
     */
    start(args: {
        expired_at: Date,
        owner_ids: Array<string>
    }) {
        return async (ownerRepository: OwnerRepository, transactionRepository: TransactionRepository) => {
            // 所有者取得
            let owners: Array<Owner> = [];
            let promises = args.owner_ids.map(async (ownerId) => {
                let option = await ownerRepository.findById(ownerId);
                if (option.isEmpty) throw new Error("owner not found.");
                owners.push(option.get());
            });
            await Promise.all(promises);

            // イベント作成
            let event = TransactionEventFactory.create({
                _id: mongoose.Types.ObjectId().toString(),
                group: TransactionEventGroup.START,
            });

            // 取引作成
            let transaction = TransactionFactory.create({
                _id: mongoose.Types.ObjectId().toString(),
                status: TransactionStatus.PROCESSING,
                events: [event],
                owners: owners,
                expired_at: args.expired_at
            });

            // 永続化
            await transactionRepository.store(transaction);
            return transaction;
        }
    }

    authorizeAsset(authorization: AssetAuthorization) {
        return async (assetRepository: AssetRepository) => {
            console.log(authorization);
            console.log(assetRepository);
        }
    }

    /** 内部資産承認 */
    addAssetAuthorization(args: {
        transaction_id: string,
        authorization_id: string,
    }) {
        return async (assetAuthorizationRepository: AssetAuthorizationRepository, transactionRepository: TransactionRepository) => {
            // GMO承認を作成
            let option = await assetAuthorizationRepository.findById(args.authorization_id);
            if (option.isEmpty) throw new Error("authorization not found.");

            // 永続化
            await this.pushAuthorization({
                transaction_id: args.transaction_id,
                authorization: option.get()
            })(transactionRepository);

            return option.get();
        }
    }

    /** GMO資産承認 */
    addGMOAuthorization(args: {
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
            // 取引取得
            let optionTransaction = await transactionRepository.findById(args.transaction_id);
            if (optionTransaction.isEmpty) throw new Error(`transaction[${args.transaction_id}] not found.`);
            let transaction = optionTransaction.get();

            // 所有者が取引に存在するかチェック
            // TODO ObjectIDとStringの問題を解決する
            let ownerIds = transaction.owners.map((owner) => {
                return owner._id.toString();
            });
            if (ownerIds.indexOf(args.owner_id_from) < 0) throw new Error(`transaction[${args.transaction_id}] does not contain a owner[${args.owner_id_from}].`);
            if (ownerIds.indexOf(args.owner_id_to) < 0) throw new Error(`transaction[${args.transaction_id}] does not contain a owner[${args.owner_id_to}].`);

            // 所有者from取得
            let optionOwnerFrom = await ownerRepository.findById(args.owner_id_from);
            if (optionOwnerFrom.isEmpty) throw new Error(`owner[${args.owner_id_from}] not found.`);

            // 所有者to取得
            let optionOwnerTo = await ownerRepository.findById(args.owner_id_to);
            if (optionOwnerTo.isEmpty) throw new Error(`owner[${args.owner_id_to}] not found.`);

            // GMO承認作成
            let authorization = AuthorizationFactory.createGMO({
                _id: mongoose.Types.ObjectId().toString(),
                order_id: args.gmo_order_id,
                price: parseInt(args.gmo_amount),
                owner_from: optionOwnerFrom.get(),
                owner_to: optionOwnerTo.get(),
            });

            // 永続化
            await this.pushAuthorization({
                transaction_id: args.transaction_id,
                authorization: authorization
            })(transactionRepository);

            return authorization;
        }
    }

    /** COA資産承認 */
    addCOASeatReservationAuthorization(args: {
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
            // 取引取得
            let optionTransaction = await transactionRepository.findById(args.transaction_id);
            if (optionTransaction.isEmpty) throw new Error(`transaction[${args.transaction_id}] not found.`);
            let transaction = optionTransaction.get();

            // 所有者が取引に存在するかチェック
            // TODO ObjectIDとStringの問題を解決する
            let ownerIds = transaction.owners.map((owner) => {
                return owner._id.toString();
            });
            if (ownerIds.indexOf(args.owner_id_from) < 0) throw new Error(`transaction[${args.transaction_id}] does not contain a owner[${args.owner_id_from}].`);
            if (ownerIds.indexOf(args.owner_id_to) < 0) throw new Error(`transaction[${args.transaction_id}] does not contain a owner[${args.owner_id_to}].`);

            // 所有者from取得
            let optionOwnerFrom = await ownerRepository.findById(args.owner_id_from);
            if (optionOwnerFrom.isEmpty) throw new Error(`owner[${args.owner_id_from}] not found.`);

            // 所有者to取得
            let optionOwnerTo = await ownerRepository.findById(args.owner_id_to);
            if (optionOwnerTo.isEmpty) throw new Error(`owner[${args.owner_id_to}] not found.`);

            // 承認作成
            let authorization = AuthorizationFactory.createCOASeatReservation({
                _id: mongoose.Types.ObjectId().toString(),
                coa_tmp_reserve_num: args.coa_tmp_reserve_num,
                price: args.price,
                owner_from: optionOwnerFrom.get(),
                owner_to: optionOwnerTo.get(),
                seats: args.seats
            });

            // 永続化
            await this.pushAuthorization({
                transaction_id: args.transaction_id,
                authorization: authorization
            })(transactionRepository);

            return authorization;
        }
    }

    /**
     * 取引に承認を追加する
     */
    private pushAuthorization(args: {
        transaction_id: string,
        authorization: Authorization
    }) {
        return async (transactionRepository: TransactionRepository) => {
            // イベント作成
            let event = TransactionEventFactory.createAuthorize({
                _id: mongoose.Types.ObjectId().toString(),
                authorization: args.authorization,
            });

            // 永続化
            let option = await transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
                status: TransactionStatus.PROCESSING,
            }, {
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

    /**
     * 資産承認解除
     */
    removeAuthorization(args: {
        transaction_id: string,
        authorization_id: string,
    }) {
        return async (transactionRepository: TransactionRepository) => {
            // イベント作成
            let event = TransactionEventFactory.createUnauthorize({
                _id: mongoose.Types.ObjectId().toString(),
                authorization_id: args.authorization_id,
            });

            // 永続化
            let option = await transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
                status: TransactionStatus.PROCESSING
            }, {
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

    /**
     * 照合を可能にする
     */
    enableInquiry(args: {
        transaction_id: string,
        inquiry_id: string,
        inquiry_pass: string,
    }) {
        return async (transactionRepository: TransactionRepository) => {
            // 永続化
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

    /**
     * 照合する
     */
    inquiry(args: {
        inquiry_id: string,
        inquiry_pass: string,
    }) {
        return async (transactionRepository: TransactionRepository) => {
            // 取引取得
            let transactions = await transactionRepository.find({
                inquiry_id: args.inquiry_id,
                inquiry_pass: args.inquiry_pass,
                status: TransactionStatus.CLOSED
            });
            if (transactions.length === 0) return monapt.None;

            return monapt.Option(transactions[0]);
        };
    }

    /**
     * 取引成立
     */
    close(args: {
        transaction_id: string
    }) {
        return async (transactionRepository: TransactionRepository) => {
            // TODO キューリストを事前作成する
            // 取引取得
            let optionTransaction = await transactionRepository.findById(args.transaction_id);
            if (optionTransaction.isEmpty) throw new Error("transaction not found.");
            let transaction = optionTransaction.get();

            // キュー作成
            let queues: Array<Queue> = [];
            transaction.authorizations.forEach((authorization) => {
                queues.push(QueueFactory.createSettleAuthorization({
                    _id: mongoose.Types.ObjectId().toString(),
                    authorization: authorization,
                    status: QueueStatus.UNEXECUTED,
                    executed_at: new Date(), // TODO 調整
                    count_try: 0
                }));
            });
            transaction.emails.forEach((email) => {
                queues.push(QueueFactory.createSendEmail({
                    _id: mongoose.Types.ObjectId().toString(),
                    email: email,
                    status: QueueStatus.UNEXECUTED,
                    executed_at: new Date(), // TODO 調整
                    count_try: 0
                }));
            });

            // イベント作成
            let event = new TransactionEvent(
                mongoose.Types.ObjectId().toString(),
                TransactionEventGroup.CLOSE,
            );

            // 永続化
            let option = await transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
                status: TransactionStatus.PROCESSING
            }, {
                    $set: {
                        status: TransactionStatus.CLOSED
                    },
                    $push: {
                        events: event,
                    },
                    $addToSet: {
                        queues: { $each: queues }
                    }
                });
            if (option.isEmpty) throw new Error("processing transaction not found.");
        }
    }

    /**
     * 取引期限切れ
     */
    expire(args: {
        transaction_id: string
    }) {
        return async (transactionRepository: TransactionRepository) => {
            // イベント作成
            let event = TransactionEventFactory.create({
                _id: mongoose.Types.ObjectId().toString(),
                group: TransactionEventGroup.EXPIRE,
            });

            // TODO キューリストを事前作成する

            // 永続化
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

    /**
     * 取引取消
     */
    cancel(args: {
        transaction_id: string
    }) {
        return async (transactionRepository: TransactionRepository) => {
            // イベント作成
            let event = new TransactionEvent(
                mongoose.Types.ObjectId().toString(),
                TransactionEventGroup.CANCEL,
            );

            // TODO キューリストを事前作成する

            // 永続化
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

    /**
     * キュー出力
     */
    exportQueues(args: {
        transaction_id: string
    }) {
        return async (transactionRepository: TransactionRepository, queueRepository: QueueRepository) => {
            let option = await transactionRepository.findById(args.transaction_id);
            if (option.isEmpty) throw new Error("transaction not found.");

            let transaction = option.get();
            let promises = transaction.queues.map(async (queue) => {
                await queueRepository.store(queue);
            });
            await Promise.all(promises);
        }
    }

    /**
     * メール追加
     */
    addEmail(args: {
        transaction_id: string,
        from: string,
        to: string,
        subject: string,
        body: string,
    }) {
        return async (transactionRepository: TransactionRepository) => {
            // メール作成
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
                    $addToSet: {
                        emails: email,
                    }
                });

            if (option.isEmpty) throw new Error("processing transaction not found.");

            return email;
        }
    }

    /**
     * メール削除
     */
    removeEmail(args: {
        transaction_id: string,
        email_id: string,
    }) {
        return async (transactionRepository: TransactionRepository) => {
            // 永続化
            let option = await transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
                status: TransactionStatus.PROCESSING
            }, {
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

export default new TransactionServiceInterpreter();