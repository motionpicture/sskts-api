"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const objectId_1 = require("../../model/objectId");
const ownerGroup_1 = require("../../model/ownerGroup");
const transactionStatus_1 = require("../../model/transactionStatus");
const transactionEventGroup_1 = require("../../model/transactionEventGroup");
const queueStatus_1 = require("../../model/queueStatus");
const AuthorizationFactory = require("../../factory/authorization");
const TransactionFactory = require("../../factory/transaction");
const TransactionEventFactory = require("../../factory/transactionEvent");
const QueueFactory = require("../../factory/queue");
const NotificationFactory = require("../../factory/notification");
const OwnerFactory = require("../../factory/owner");
const OwnershipFactory = require("../../factory/ownership");
const AssetFactory = require("../../factory/asset");
class TransactionServiceInterpreter {
    updateAnonymousOwner(args) {
        return (ownerRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let optionTransaction = yield transactionRepository.findById(objectId_1.default(args.transaction_id));
            if (optionTransaction.isEmpty)
                throw new Error(`transaction[${objectId_1.default(args.transaction_id)}] not found.`);
            let transaction = optionTransaction.get();
            let anonymousOwner = transaction.owners.find((owner) => {
                return (owner.group === ownerGroup_1.default.ANONYMOUS);
            });
            if (!anonymousOwner)
                throw new Error("anonymous owner not found.");
            let option = yield ownerRepository.findOneAndUpdate({
                _id: anonymousOwner._id,
            }, {
                $set: {
                    name_first: args.name_first,
                    name_last: args.name_last,
                    email: args.email,
                    tel: args.tel,
                }
            });
            if (option.isEmpty)
                throw new Error("owner not found.");
        });
    }
    findById(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            return yield transactionRepository.findById(objectId_1.default(args.transaction_id));
        });
    }
    start(args) {
        return (ownerRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let anonymousOwner = OwnerFactory.createAnonymous({
                _id: objectId_1.default()
            });
            let option = yield ownerRepository.findPromoter();
            if (option.isEmpty)
                throw new Error("promoter not found.");
            let promoter = option.get();
            let event = TransactionEventFactory.create({
                _id: objectId_1.default(),
                group: transactionEventGroup_1.default.START,
                occurred_at: new Date(),
            });
            let transaction = TransactionFactory.create({
                _id: objectId_1.default(),
                status: transactionStatus_1.default.UNDERWAY,
                events: [event],
                owners: [promoter, anonymousOwner],
                expired_at: args.expired_at
            });
            yield ownerRepository.store(anonymousOwner);
            yield transactionRepository.store(transaction);
            return transaction;
        });
    }
    addGMOAuthorization(args) {
        return (ownerRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let optionTransaction = yield transactionRepository.findById(objectId_1.default(args.transaction_id));
            if (optionTransaction.isEmpty)
                throw new Error(`transaction[${objectId_1.default(args.transaction_id)}] not found.`);
            let transaction = optionTransaction.get();
            let ownerIds = transaction.owners.map((owner) => {
                return owner._id.toString();
            });
            if (ownerIds.indexOf(args.owner_id_from) < 0)
                throw new Error(`transaction[${objectId_1.default(args.transaction_id)}] does not contain a owner[${args.owner_id_from}].`);
            if (ownerIds.indexOf(args.owner_id_to) < 0)
                throw new Error(`transaction[${objectId_1.default(args.transaction_id)}] does not contain a owner[${args.owner_id_to}].`);
            let optionOwnerFrom = yield ownerRepository.findById(objectId_1.default(args.owner_id_from));
            if (optionOwnerFrom.isEmpty)
                throw new Error(`owner[${args.owner_id_from}] not found.`);
            let optionOwnerTo = yield ownerRepository.findById(objectId_1.default(args.owner_id_to));
            if (optionOwnerTo.isEmpty)
                throw new Error(`owner[${args.owner_id_to}] not found.`);
            let authorization = AuthorizationFactory.createGMO({
                _id: objectId_1.default(),
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
            yield this.pushAuthorization({
                transaction_id: args.transaction_id,
                authorization: authorization
            })(transactionRepository);
            return authorization;
        });
    }
    addCOASeatReservationAuthorization(args) {
        return (ownerRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let optionTransaction = yield transactionRepository.findById(objectId_1.default(args.transaction_id));
            if (optionTransaction.isEmpty)
                throw new Error(`transaction[${objectId_1.default(args.transaction_id)}] not found.`);
            let transaction = optionTransaction.get();
            let ownerIds = transaction.owners.map((owner) => {
                return owner._id.toString();
            });
            if (ownerIds.indexOf(args.owner_id_from) < 0)
                throw new Error(`transaction[${objectId_1.default(args.transaction_id)}] does not contain a owner[${args.owner_id_from}].`);
            if (ownerIds.indexOf(args.owner_id_to) < 0)
                throw new Error(`transaction[${objectId_1.default(args.transaction_id)}] does not contain a owner[${args.owner_id_to}].`);
            let optionOwnerFrom = yield ownerRepository.findById(objectId_1.default(args.owner_id_from));
            if (optionOwnerFrom.isEmpty)
                throw new Error(`owner[${args.owner_id_from}] not found.`);
            let optionOwnerTo = yield ownerRepository.findById(objectId_1.default(args.owner_id_to));
            if (optionOwnerTo.isEmpty)
                throw new Error(`owner[${args.owner_id_to}] not found.`);
            let authorization = AuthorizationFactory.createCOASeatReservation({
                _id: objectId_1.default(),
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
                        _id: objectId_1.default(),
                        ownership: OwnershipFactory.create({
                            _id: objectId_1.default(),
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
            yield this.pushAuthorization({
                transaction_id: args.transaction_id,
                authorization: authorization
            })(transactionRepository);
            return authorization;
        });
    }
    pushAuthorization(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = TransactionEventFactory.createAuthorize({
                _id: objectId_1.default(),
                occurred_at: new Date(),
                authorization: args.authorization,
            });
            let option = yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(args.transaction_id),
                status: transactionStatus_1.default.UNDERWAY,
            }, {
                $push: {
                    events: event,
                },
            });
            if (option.isEmpty)
                throw new Error("UNDERWAY transaction not found.");
        });
    }
    removeAuthorization(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let optionTransacton = yield transactionRepository.findById(objectId_1.default(args.transaction_id));
            if (optionTransacton.isEmpty)
                throw new Error("tranasction not found.");
            let transaction = optionTransacton.get();
            let authorizations = transaction.authorizations();
            let authorization = authorizations.find((authorization) => {
                return (authorization._id.toString() === args.authorization_id);
            });
            if (!authorization)
                throw new Error(`authorization [${args.authorization_id}] not found in the transaction.`);
            let event = TransactionEventFactory.createUnauthorize({
                _id: objectId_1.default(),
                occurred_at: new Date(),
                authorization: authorization,
            });
            let option = yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(args.transaction_id),
                status: transactionStatus_1.default.UNDERWAY
            }, {
                $push: {
                    events: event,
                },
            });
            if (option.isEmpty)
                throw new Error("UNDERWAY transaction not found.");
        });
    }
    enableInquiry(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let option = yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(args.transaction_id),
                status: transactionStatus_1.default.UNDERWAY
            }, {
                $set: {
                    inquiry_theater: args.inquiry_theater,
                    inquiry_id: args.inquiry_id,
                    inquiry_pass: args.inquiry_pass,
                },
            });
            if (option.isEmpty)
                throw new Error("UNDERWAY transaction not found.");
        });
    }
    makeInquiry(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            return yield transactionRepository.findOne({
                inquiry_theater: args.inquiry_theater,
                inquiry_id: args.inquiry_id,
                inquiry_pass: args.inquiry_pass,
                status: transactionStatus_1.default.CLOSED
            });
        });
    }
    close(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let optionTransaction = yield transactionRepository.findById(objectId_1.default(args.transaction_id));
            if (optionTransaction.isEmpty)
                throw new Error("transaction not found.");
            let transaction = optionTransaction.get();
            if (!transaction.isInquiryAvailable())
                throw new Error("inquiry is not available.");
            if (!transaction.canBeClosed())
                throw new Error("transaction cannot be closed.");
            let queues = [];
            transaction.authorizations().forEach((authorization) => {
                queues.push(QueueFactory.createSettleAuthorization({
                    _id: objectId_1.default(),
                    authorization: authorization,
                    status: queueStatus_1.default.UNEXECUTED,
                    run_at: new Date(),
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: []
                }));
            });
            transaction.notifications().forEach((notification) => {
                queues.push(QueueFactory.createPushNotification({
                    _id: objectId_1.default(),
                    notification: notification,
                    status: queueStatus_1.default.UNEXECUTED,
                    run_at: new Date(),
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: []
                }));
            });
            let event = TransactionEventFactory.create({
                _id: objectId_1.default(),
                group: transactionEventGroup_1.default.CLOSE,
                occurred_at: new Date(),
            });
            let option = yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(args.transaction_id),
                status: transactionStatus_1.default.UNDERWAY
            }, {
                $set: {
                    status: transactionStatus_1.default.CLOSED,
                    queues: queues
                },
                $push: {
                    events: event,
                }
            });
            if (option.isEmpty)
                throw new Error("UNDERWAY transaction not found.");
        });
    }
    expireOne() {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = TransactionEventFactory.create({
                _id: objectId_1.default(),
                group: transactionEventGroup_1.default.EXPIRE,
                occurred_at: new Date(),
            });
            yield transactionRepository.findOneAndUpdate({
                status: transactionStatus_1.default.UNDERWAY,
                expired_at: { $lt: new Date() },
            }, {
                $set: {
                    status: transactionStatus_1.default.EXPIRED,
                },
                $push: {
                    events: event,
                }
            });
        });
    }
    exportQueues(args) {
        return (transactionRepository, queueRepository) => __awaiter(this, void 0, void 0, function* () {
            let option = yield transactionRepository.findById(objectId_1.default(args.transaction_id));
            if (option.isEmpty)
                throw new Error("transaction not found.");
            let transaction = option.get();
            let queues;
            switch (transaction.status) {
                case transactionStatus_1.default.CLOSED:
                    queues = transaction.queues;
                    break;
                case transactionStatus_1.default.EXPIRED:
                    queues = [];
                    transaction.authorizations().forEach((authorization) => {
                        queues.push(QueueFactory.createCancelAuthorization({
                            _id: objectId_1.default(),
                            authorization: authorization,
                            status: queueStatus_1.default.UNEXECUTED,
                            run_at: new Date(),
                            max_count_try: 10,
                            last_tried_at: null,
                            count_tried: 0,
                            results: []
                        }));
                    });
                    if (transaction.isInquiryAvailable()) {
                        queues.push(QueueFactory.createDisableTransactionInquiry({
                            _id: objectId_1.default(),
                            transaction_id: transaction._id,
                            status: queueStatus_1.default.UNEXECUTED,
                            run_at: new Date(),
                            max_count_try: 10,
                            last_tried_at: null,
                            count_tried: 0,
                            results: []
                        }));
                    }
                    let eventStart = transaction.events.find((event) => { return (event.group === transactionEventGroup_1.default.START); });
                    queues.push(QueueFactory.createPushNotification({
                        _id: objectId_1.default(),
                        notification: NotificationFactory.createEmail({
                            _id: objectId_1.default(),
                            from: "noreply@localhost",
                            to: "hello@motionpicture.jp",
                            subject: "transaction expired",
                            content: `
取引の期限がきれました
_id: ${transaction._id}
created_at: ${(eventStart) ? eventStart.occurred_at : ""}
`
                        }),
                        status: queueStatus_1.default.UNEXECUTED,
                        run_at: new Date(),
                        max_count_try: 10,
                        last_tried_at: null,
                        count_tried: 0,
                        results: []
                    }));
                    break;
                default:
                    throw new Error("transaction group not implemented.");
            }
            let promises = queues.map((queue) => __awaiter(this, void 0, void 0, function* () {
                yield queueRepository.store(queue);
            }));
            yield Promise.all(promises);
        });
    }
    addEmail(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let notification = NotificationFactory.createEmail({
                _id: objectId_1.default(),
                from: args.from,
                to: args.to,
                subject: args.subject,
                content: args.content,
            });
            let event = TransactionEventFactory.createNotificationAdd({
                _id: objectId_1.default(),
                occurred_at: new Date(),
                notification: notification,
            });
            let option = yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(args.transaction_id),
                status: transactionStatus_1.default.UNDERWAY,
            }, {
                $push: {
                    events: event,
                },
            });
            if (option.isEmpty)
                throw new Error("UNDERWAY transaction not found.");
            return notification;
        });
    }
    removeEmail(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let optionTransacton = yield transactionRepository.findById(objectId_1.default(args.transaction_id));
            if (optionTransacton.isEmpty)
                throw new Error("tranasction not found.");
            let transaction = optionTransacton.get();
            let notifications = transaction.notifications();
            let notification = notifications.find((notification) => {
                return (notification._id.toString() === args.notification_id);
            });
            if (!notification)
                throw new Error(`notification [${args.notification_id}] not found in the transaction.`);
            let event = TransactionEventFactory.createNotificationRemove({
                _id: objectId_1.default(),
                occurred_at: new Date(),
                notification: notification,
            });
            let option = yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(args.transaction_id),
                status: transactionStatus_1.default.UNDERWAY,
            }, {
                $push: {
                    events: event,
                },
            });
            if (option.isEmpty)
                throw new Error("UNDERWAY transaction not found.");
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new TransactionServiceInterpreter();
