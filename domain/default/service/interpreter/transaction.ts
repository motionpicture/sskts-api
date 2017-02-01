import monapt = require("monapt");

import TransactionService from "../transaction";

import ObjectId from "../../model/objectId";
import OwnerGroup from "../../model/ownerGroup";
import TransactionStatus from "../../model/transactionStatus";
import TransactionEventGroup from "../../model/transactionEventGroup";
import Authorization from "../../model/authorization";
import Queue from "../../model/queue";
import QueueStatus from "../../model/queueStatus";

import AssetRepository from "../../repository/asset";
import TransactionRepository from "../../repository/transaction";
import OwnerRepository from "../../repository/owner";
import QueueRepository from "../../repository/queue";

import * as AuthorizationFactory from "../../factory/authorization";
import * as TransactionFactory from "../../factory/transaction";
import * as TransactionEventFactory from "../../factory/transactionEvent";
import * as QueueFactory from "../../factory/queue";
import * as NotificationFactory from "../../factory/notification";
import * as OwnerFactory from "../../factory/owner";
import * as OwnershipFactory from "../../factory/ownership";
import * as AssetFactory from "../../factory/asset";

class TransactionServiceInterpreter implements TransactionService {
    /**
     * 匿名所有者更新
     */
    updateAnonymousOwner(args: {
        transaction_id: string,
        name_first?: string,
        name_last?: string,
        email?: string,
        tel?: string,
    }) {
        return async (ownerRepository: OwnerRepository, transactionRepository: TransactionRepository) => {
            // 取引取得
            let optionTransaction = await transactionRepository.findById(ObjectId(args.transaction_id));
            if (optionTransaction.isEmpty) throw new Error(`transaction[${ObjectId(args.transaction_id)}] not found.`);
            let transaction = optionTransaction.get();

            let anonymousOwner = transaction.owners.find((owner) => {
                return (owner.group === OwnerGroup.ANONYMOUS);
            });
            if (!anonymousOwner) throw new Error("anonymous owner not found.");

            // 永続化
            let option = await ownerRepository.findOneAndUpdate({
                _id: anonymousOwner._id,
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
    }) {
        return async (ownerRepository: OwnerRepository, transactionRepository: TransactionRepository) => {
            // 一般所有者作成
            let anonymousOwner = OwnerFactory.createAnonymous({
                _id: ObjectId()
            });

            // 興行主取得
            let option = await ownerRepository.findPromoter();
            if (option.isEmpty) throw new Error("promoter not found.");
            let promoter = option.get();

            // イベント作成
            let event = TransactionEventFactory.create({
                _id: ObjectId(),
                group: TransactionEventGroup.START,
                occurred_at: new Date(),
            });

            // 取引作成
            let transaction = TransactionFactory.create({
                _id: ObjectId(),
                status: TransactionStatus.UNDERWAY,
                events: [event],
                owners: [promoter, anonymousOwner],
                expired_at: args.expired_at
            });

            // 永続化
            await ownerRepository.store(anonymousOwner);
            await transactionRepository.store(transaction);

            return transaction;
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
                owner_from: optionOwnerFrom.get()._id,
                owner_to: optionOwnerTo.get()._id,
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
        coa_tmp_reserve_num: number,
        coa_theater_code: string,
        coa_date_jouei: string,
        coa_title_code: string,
        coa_title_branch_num: string,
        coa_time_begin: string,
        coa_screen_code: string,
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
                coa_theater_code: args.coa_theater_code,
                coa_date_jouei: args.coa_date_jouei,
                coa_title_code: args.coa_title_code,
                coa_title_branch_num: args.coa_title_branch_num,
                coa_time_begin: args.coa_time_begin,
                coa_screen_code: args.coa_screen_code,
                price: args.price,
                owner_from: optionOwnerFrom.get()._id,
                owner_to: optionOwnerTo.get()._id,
                assets: args.seats.map((seat) => {
                    return AssetFactory.createSeatReservation({
                        _id: ObjectId(),
                        ownership: OwnershipFactory.create({
                            _id: ObjectId(),
                            owner: optionOwnerTo.get(),
                            authenticated: false
                        }),
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
                occurred_at: new Date(),
                authorization: args.authorization,
            });

            // 永続化
            let option = await transactionRepository.findOneAndUpdate({
                _id: ObjectId(args.transaction_id),
                status: TransactionStatus.UNDERWAY,
            }, {
                    $push: {
                        events: event,
                    },
                });
            if (option.isEmpty) throw new Error("UNDERWAY transaction not found.");
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
            // 取引取得
            let optionTransacton = await transactionRepository.findById(ObjectId(args.transaction_id));
            if (optionTransacton.isEmpty) throw new Error("tranasction not found.");

            let transaction = optionTransacton.get();
            let authorizations = transaction.authorizations();
            let authorization = authorizations.find((authorization) => {
                return (authorization._id.toString() === args.authorization_id);
            });
            if (!authorization) throw new Error(`authorization [${args.authorization_id}] not found in the transaction.`);

            // イベント作成
            let event = TransactionEventFactory.createUnauthorize({
                _id: ObjectId(),
                occurred_at: new Date(),
                authorization: authorization,
            });

            // 永続化
            let option = await transactionRepository.findOneAndUpdate({
                _id: ObjectId(args.transaction_id),
                status: TransactionStatus.UNDERWAY
            }, {
                    $push: {
                        events: event,
                    },
                });
            if (option.isEmpty) throw new Error("UNDERWAY transaction not found.");
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
                status: TransactionStatus.UNDERWAY
            }, {
                    $set: {
                        inquiry_id: args.inquiry_id,
                        inquiry_pass: args.inquiry_pass,
                    },
                });
            if (option.isEmpty) throw new Error("UNDERWAY transaction not found.");
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

            // 条件が対等かどうかチェック
            if (!transaction.canBeClosed()) throw new Error("transaction cannot be closed.");

            // キューリストを事前作成
            let queues: Array<Queue> = [];
            transaction.authorizations().forEach((authorization) => {
                queues.push(QueueFactory.createSettleAuthorization({
                    _id: ObjectId(),
                    authorization: authorization,
                    status: QueueStatus.UNEXECUTED,
                    run_at: new Date(), // なるはやで実行
                    max_count_retry: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: []
                }));
            });
            transaction.notifications().forEach((notification) => {
                queues.push(QueueFactory.createNotificationPush({
                    _id: ObjectId(),
                    notification: notification,
                    status: QueueStatus.UNEXECUTED,
                    run_at: new Date(), // TODO emailのsent_atを指定
                    max_count_retry: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: []
                }));
            });

            // イベント作成
            let event = TransactionEventFactory.create({
                _id: ObjectId(),
                group: TransactionEventGroup.CLOSE,
                occurred_at: new Date(),
            });

            // 永続化
            let option = await transactionRepository.findOneAndUpdate({
                _id: ObjectId(args.transaction_id),
                status: TransactionStatus.UNDERWAY
            }, {
                    $set: {
                        status: TransactionStatus.CLOSED,
                        queues: queues
                    },
                    $push: {
                        events: event,
                    }
                });
            if (option.isEmpty) throw new Error("UNDERWAY transaction not found.");
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
            transaction.authorizations().forEach((authorization) => {
                queues.push(QueueFactory.createCancelAuthorization({
                    _id: ObjectId(),
                    authorization: authorization,
                    status: QueueStatus.UNEXECUTED,
                    run_at: new Date(),
                    max_count_retry: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: []
                }));
            });

            // TODO おそらく開発時のみ
            let eventStart = transaction.events.find((event) => { return (event.group === TransactionEventGroup.START) });
            queues.push(QueueFactory.createNotificationPush({
                _id: ObjectId(),
                notification: NotificationFactory.createEmail({
                    _id: ObjectId(),
                    from: "noreply@localhost",
                    to: "hello@motionpicture.jp",
                    subject: "transaction expired",
                    content: `
取引の期限がきれました
_id: ${transaction._id}
created_at: ${(eventStart) ? eventStart.occurred_at : ""}
`
                }),
                status: QueueStatus.UNEXECUTED,
                run_at: new Date(),
                max_count_retry: 10,
                last_tried_at: null,
                count_tried: 0,
                results: []
            }));

            // イベント作成
            let event = TransactionEventFactory.create({
                _id: ObjectId(),
                group: TransactionEventGroup.EXPIRE,
                occurred_at: new Date(),
            });

            // 永続化
            await transactionRepository.findOneAndUpdate({
                _id: ObjectId(args.transaction_id),
                status: TransactionStatus.UNDERWAY
            }, {
                    $set: {
                        status: TransactionStatus.EXPIRED,
                        queues: queues
                    },
                    $push: {
                        events: event,
                    }
                });

            // 永続化結果がemptyの場合は、もう取引中ステータスではないということなので、期限切れタスクとしては成功
            // if (option.isEmpty) throw new Error("UNDERWAY transaction not found.");
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
        content: string,
    }) {
        return async (transactionRepository: TransactionRepository) => {
            // メール作成
            let notification = NotificationFactory.createEmail({
                _id: ObjectId(),
                from: args.from,
                to: args.to,
                subject: args.subject,
                content: args.content,
            });

            // イベント作成
            let event = TransactionEventFactory.createNotificationAdd({
                _id: ObjectId(),
                occurred_at: new Date(),
                notification: notification,
            });

            // 永続化
            let option = await transactionRepository.findOneAndUpdate({
                _id: ObjectId(args.transaction_id),
                status: TransactionStatus.UNDERWAY,
            }, {
                    $push: {
                        events: event,
                    },
                });

            if (option.isEmpty) throw new Error("UNDERWAY transaction not found.");

            return notification;
        }
    }

    /**
     * メール削除
     */
    removeEmail(args: {
        transaction_id: string,
        notification_id: string,
    }) {
        return async (transactionRepository: TransactionRepository) => {
            // 取引取得
            let optionTransacton = await transactionRepository.findById(ObjectId(args.transaction_id));
            if (optionTransacton.isEmpty) throw new Error("tranasction not found.");

            let transaction = optionTransacton.get();
            let notifications = transaction.notifications();
            let notification = notifications.find((notification) => {
                return (notification._id.toString() === args.notification_id);
            });
            if (!notification) throw new Error(`notification [${args.notification_id}] not found in the transaction.`);


            // イベント作成
            let event = TransactionEventFactory.createNotificationRemove({
                _id: ObjectId(),
                occurred_at: new Date(),
                notification: notification,
            });

            // 永続化
            let option = await transactionRepository.findOneAndUpdate({
                _id: ObjectId(args.transaction_id),
                status: TransactionStatus.UNDERWAY,
            }, {
                    $push: {
                        events: event,
                    },
                });

            if (option.isEmpty) throw new Error("UNDERWAY transaction not found.");
        }
    }
}

export default new TransactionServiceInterpreter();