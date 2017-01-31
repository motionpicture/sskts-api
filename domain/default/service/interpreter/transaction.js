"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const monapt = require("monapt");
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
    authorizeAsset(authorization) {
        return (assetRepository) => __awaiter(this, void 0, void 0, function* () {
            console.log(authorization);
            console.log(assetRepository);
        });
    }
    addAssetAuthorization(args) {
        return (assetRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            console.log(args, assetRepository, transactionRepository);
            throw new Error("not implemented.");
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
                    inquiry_id: args.inquiry_id,
                    inquiry_pass: args.inquiry_pass,
                },
            });
            if (option.isEmpty)
                throw new Error("UNDERWAY transaction not found.");
        });
    }
    inquiry(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let transactions = yield transactionRepository.find({
                inquiry_id: args.inquiry_id,
                inquiry_pass: args.inquiry_pass,
                status: transactionStatus_1.default.CLOSED
            });
            if (transactions.length === 0)
                return monapt.None;
            return monapt.Option(transactions[0]);
        });
    }
    close(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let optionTransaction = yield transactionRepository.findById(objectId_1.default(args.transaction_id));
            if (optionTransaction.isEmpty)
                throw new Error("transaction not found.");
            let transaction = optionTransaction.get();
            let queues = [];
            transaction.authorizations().forEach((authorization) => {
                queues.push(QueueFactory.createSettleAuthorization({
                    _id: objectId_1.default(),
                    authorization: authorization,
                    status: queueStatus_1.default.UNEXECUTED,
                    executed_at: new Date(),
                    count_try: 0
                }));
            });
            transaction.notifications().forEach((notification) => {
                queues.push(QueueFactory.createNotificationPush({
                    _id: objectId_1.default(),
                    notification: notification,
                    status: queueStatus_1.default.UNEXECUTED,
                    executed_at: new Date(),
                    count_try: 0
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
    expire(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let optionTransaction = yield transactionRepository.findById(objectId_1.default(args.transaction_id));
            if (optionTransaction.isEmpty)
                throw new Error("transaction not found.");
            let transaction = optionTransaction.get();
            let queues = [];
            transaction.authorizations().forEach((authorization) => {
                queues.push(QueueFactory.createCancelAuthorization({
                    _id: objectId_1.default(),
                    authorization: authorization,
                    status: queueStatus_1.default.UNEXECUTED,
                    executed_at: new Date(),
                    count_try: 0
                }));
            });
            let eventStart = transaction.events.find((event) => { return (event.group === transactionEventGroup_1.default.START); });
            queues.push(QueueFactory.createNotificationPush({
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
                executed_at: new Date(),
                count_try: 0
            }));
            let event = TransactionEventFactory.create({
                _id: objectId_1.default(),
                group: transactionEventGroup_1.default.EXPIRE,
                occurred_at: new Date(),
            });
            yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(args.transaction_id),
                status: transactionStatus_1.default.UNDERWAY
            }, {
                $set: {
                    status: transactionStatus_1.default.EXPIRED,
                    queues: queues
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
            let promises = transaction.queues.map((queue) => __awaiter(this, void 0, void 0, function* () {
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
