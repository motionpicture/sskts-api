import monapt = require("monapt");

import TransactionService from "../transaction";

import ObjectId from "../../model/objectId";
import Owner from "../../model/owner";
import TransactionStatus from "../../model/transactionStatus";
import TransactionEventGroup from "../../model/transactionEventGroup";
import Authorization from "../../model/authorization";
import Queue from "../../model/queue";
import QueueStatus from "../../model/queueStatus";
import AssetAuthorization from "../../model/authorization/asset";

import AssetRepository from "../../repository/asset";
import TransactionRepository from "../../repository/transaction";
import OwnerRepository from "../../repository/owner";
import QueueRepository from "../../repository/queue";

import * as AuthorizationFactory from "../../factory/authorization";
import * as TransactionFactory from "../../factory/transaction";
import * as TransactionEventFactory from "../../factory/transactionEvent";
import * as QueueFactory from "../../factory/queue";
import * as EmailFactory from "../../factory/email";
import * as OwnerFactory from "../../factory/owner";
import * as AssetFactory from "../../factory/asset";

class TransactionServiceInterpreter implements TransactionService {
    /**
     * 匿名所有者作成
     */
    createAnonymousOwner() {
        return async (repository: OwnerRepository) => {
            let owner = OwnerFactory.createAnonymous({
                _id: ObjectId()
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
        return async (repository: OwnerRepository) => {
            // 運営者取得
            let option = await repository.findAdministrator();
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
            return await transactionRepository.findById(ObjectId(args.transaction_id));
        };
    }

    /**
     * 取引開始
     */
    start(args: {
        expired_at: Date,
        owner_ids: Array<string>
    }) {
        return async (ownerRepository: OwnerRepository, transactionRepository: TransactionRepository, queueRepository: QueueRepository) => {
            // 所有者取得
            let owners: Array<Owner> = [];
            let promises = args.owner_ids.map(async (ownerId) => {
                let option = await ownerRepository.findById(ObjectId(ownerId));
                if (option.isEmpty) throw new Error("owner not found.");
                owners.push(option.get());
            });
            await Promise.all(promises);

            // イベント作成
            let event = TransactionEventFactory.create({
                _id: ObjectId(),
                group: TransactionEventGroup.START,
            });

            // 取引作成
            let transaction = TransactionFactory.create({
                _id: ObjectId(),
                status: TransactionStatus.PROCESSING,
                events: [event],
                owners: owners,
                expired_at: args.expired_at
            });

            // 永続化
            await transactionRepository.store(transaction);

            // 期限切れキュー作成
            let queue = QueueFactory.createExpireTransaction({
                _id: ObjectId(),
                transaction_id: transaction._id,
                status: QueueStatus.UNEXECUTED,
                executed_at: transaction.expired_at,
                count_try: 0,
            });

            // 永続化
            await queueRepository.store(queue);

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
        return async (assetRepository: AssetRepository, transactionRepository: TransactionRepository) => {
            console.log(args, assetRepository, transactionRepository);
            throw new Error("not implemented.");
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
        gmo_amount: number,
        gmo_access_id: string,
        gmo_access_pass: string,
        gmo_job_cd: string,
        gmo_pay_type: string,

    }) {
        return async (ownerRepository: OwnerRepository, transactionRepository: TransactionRepository) => {
            // 取引取得
            let optionTransaction = await transactionRepository.findById(ObjectId(args.transaction_id));
            if (optionTransaction.isEmpty) throw new Error(`transaction[${ObjectId(args.transaction_id)}] not found.`);
            let transaction = optionTransaction.get();

            // 所有者が取引に存在するかチェック
            let ownerIds = transaction.owners.map((owner) => {
                return owner._id.toString();
            });
            if (ownerIds.indexOf(args.owner_id_from) < 0) throw new Error(`transaction[${ObjectId(args.transaction_id)}] does not contain a owner[${args.owner_id_from}].`);
            if (ownerIds.indexOf(args.owner_id_to) < 0) throw new Error(`transaction[${ObjectId(args.transaction_id)}] does not contain a owner[${args.owner_id_to}].`);

            // 所有者from取得
            let optionOwnerFrom = await ownerRepository.findById(ObjectId(args.owner_id_from));
            if (optionOwnerFrom.isEmpty) throw new Error(`owner[${args.owner_id_from}] not found.`);

            // 所有者to取得
            let optionOwnerTo = await ownerRepository.findById(ObjectId(args.owner_id_to));
            if (optionOwnerTo.isEmpty) throw new Error(`owner[${args.owner_id_to}] not found.`);

            // GMO承認作成
            let authorization = AuthorizationFactory.createGMO({
                _id: ObjectId(),
                price: args.gmo_amount,
                owner_from: optionOwnerFrom.get(),
                owner_to: optionOwnerTo.get(),
                gmo_shop_id: args.gmo_shop_id,
                gmo_shop_pass: args.gmo_shop_pass,
                gmo_order_id: args.gmo_order_id,
                gmo_amount: args.gmo_amount,
                gmo_access_id: args.gmo_access_id,
                gmo_access_pass: args.gmo_access_pass,
                gmo_job_cd: args.gmo_job_cd,
                gmo_pay_type: args.gmo_pay_type,
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
            let optionTransaction = await transactionRepository.findById(ObjectId(args.transaction_id));
            if (optionTransaction.isEmpty) throw new Error(`transaction[${ObjectId(args.transaction_id)}] not found.`);
            let transaction = optionTransaction.get();

            // 所有者が取引に存在するかチェック
            let ownerIds = transaction.owners.map((owner) => {
                return owner._id.toString();
            });
            if (ownerIds.indexOf(args.owner_id_from) < 0) throw new Error(`transaction[${ObjectId(args.transaction_id)}] does not contain a owner[${args.owner_id_from}].`);
            if (ownerIds.indexOf(args.owner_id_to) < 0) throw new Error(`transaction[${ObjectId(args.transaction_id)}] does not contain a owner[${args.owner_id_to}].`);

            // 所有者from取得
            let optionOwnerFrom = await ownerRepository.findById(ObjectId(args.owner_id_from));
            if (optionOwnerFrom.isEmpty) throw new Error(`owner[${args.owner_id_from}] not found.`);

            // 所有者to取得
            let optionOwnerTo = await ownerRepository.findById(ObjectId(args.owner_id_to));
            if (optionOwnerTo.isEmpty) throw new Error(`owner[${args.owner_id_to}] not found.`);

            // 承認作成
            // あらかじめ資産形式に変換しておく(後に、資産移動でassetデータに追加される)
            let authorization = AuthorizationFactory.createCOASeatReservation({
                _id: ObjectId(),
                coa_tmp_reserve_num: args.coa_tmp_reserve_num,
                price: args.price,
                owner_from: optionOwnerFrom.get(),
                owner_to: optionOwnerTo.get(),
                assets: args.seats.map((seat) => {
                    return AssetFactory.createSeatReservation({
                        _id: ObjectId(),
                        owner: optionOwnerTo.get(),
                        authorizations: [],
                        performance: seat.performance,
                        section: seat.section,
                        seat_code: seat.seat_code,
                        ticket_code: seat.ticket_code,
                        ticket_name_ja: seat.ticket_name_ja,
                        ticket_name_en: seat.ticket_name_en,
                        ticket_name_kana: seat.ticket_name_kana,
                        std_price: seat.std_price,
                        add_price: seat.add_price,
                        dis_price: seat.dis_price,
                        sale_price: seat.sale_price,
                    });
                })
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
                _id: ObjectId(),
                authorization: args.authorization,
            });

            // 永続化
            let option = await transactionRepository.findOneAndUpdate({
                _id: ObjectId(args.transaction_id),
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
                _id: ObjectId(),
                authorization_id: ObjectId(args.authorization_id),
            });

            // 永続化
            let option = await transactionRepository.findOneAndUpdate({
                _id: ObjectId(args.transaction_id),
                status: TransactionStatus.PROCESSING
            }, {
                    $push: {
                        events: event,
                    },
                    $pull: {
                        authorizations: {
                            _id: ObjectId(args.authorization_id)
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
                _id: ObjectId(args.transaction_id),
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
            // 取引取得
            let optionTransaction = await transactionRepository.findById(ObjectId(args.transaction_id));
            if (optionTransaction.isEmpty) throw new Error("transaction not found.");
            let transaction = optionTransaction.get();

            // キューリストを事前作成
            let queues: Array<Queue> = [];
            transaction.authorizations.forEach((authorization) => {
                queues.push(QueueFactory.createSettleAuthorization({
                    _id: ObjectId(),
                    authorization: authorization,
                    status: QueueStatus.UNEXECUTED,
                    executed_at: new Date(), // TODO 調整
                    count_try: 0
                }));
            });
            transaction.emails.forEach((email) => {
                queues.push(QueueFactory.createSendEmail({
                    _id: ObjectId(),
                    email: email,
                    status: QueueStatus.UNEXECUTED,
                    executed_at: new Date(), // TODO 調整
                    count_try: 0
                }));
            });

            // イベント作成
            let event = TransactionEventFactory.create({
                _id: ObjectId(),
                group: TransactionEventGroup.CLOSE,
            });

            // 永続化
            let option = await transactionRepository.findOneAndUpdate({
                _id: ObjectId(args.transaction_id),
                status: TransactionStatus.PROCESSING
            }, {
                    $set: {
                        status: TransactionStatus.CLOSED,
                        queues: queues
                    },
                    $push: {
                        events: event,
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
            // 取引取得
            let optionTransaction = await transactionRepository.findById(ObjectId(args.transaction_id));
            if (optionTransaction.isEmpty) throw new Error("transaction not found.");
            let transaction = optionTransaction.get();

            // キューリストを事前作成
            let queues: Array<Queue> = [];
            transaction.authorizations.forEach((authorization) => {
                queues.push(QueueFactory.createCancelAuthorization({
                    _id: ObjectId(),
                    authorization: authorization,
                    status: QueueStatus.UNEXECUTED,
                    executed_at: new Date(),
                    count_try: 0
                }));
            });
            queues.push(QueueFactory.createSendEmail({ // TODO おそらく開発時のみ
                _id: ObjectId(),
                email: EmailFactory.create({
                    _id: ObjectId(),
                    from: "noreply@localhost",
                    to: "hello@motionpicture.jp",
                    subject: "transaction expired",
                    body: `取引[${transaction._id}]の期限がきれました`
                }),
                status: QueueStatus.UNEXECUTED,
                executed_at: new Date(),
                count_try: 0
            }));

            // イベント作成
            let event = TransactionEventFactory.create({
                _id: ObjectId(),
                group: TransactionEventGroup.EXPIRE,
            });

            // 永続化
            await transactionRepository.findOneAndUpdate({
                _id: ObjectId(args.transaction_id),
                status: TransactionStatus.PROCESSING
            }, {
                    $set: {
                        status: TransactionStatus.EXPIRED,
                        queues: queues
                    },
                    $push: {
                        events: event
                    }
                });

            // 永続化結果がemptyの場合は、もう取引中ステータスではないということなので、期限切れタスクとしては成功
            // if (option.isEmpty) throw new Error("processing transaction not found.");
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
            let event = TransactionEventFactory.create({
                _id: ObjectId(),
                group: TransactionEventGroup.CANCEL,
            });

            // TODO キューリストを事前作成する

            // 永続化
            let option = await transactionRepository.findOneAndUpdate({
                _id: ObjectId(args.transaction_id),
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
            let option = await transactionRepository.findById(ObjectId(args.transaction_id));
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
                _id: ObjectId(),
                from: args.from,
                to: args.to,
                subject: args.subject,
                body: args.body,
            });

            // 永続化
            let option = await transactionRepository.findOneAndUpdate({
                _id: ObjectId(args.transaction_id),
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
                _id: ObjectId(args.transaction_id),
                status: TransactionStatus.PROCESSING
            }, {
                    $pull: {
                        emails: {
                            _id: ObjectId(args.email_id)
                        },
                    }
                });
            if (option.isEmpty) throw new Error("processing transaction not found.");
        }
    }
}

export default new TransactionServiceInterpreter();