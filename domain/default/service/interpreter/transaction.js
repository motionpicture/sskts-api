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
const transactionStatus_1 = require("../../model/transactionStatus");
const transactionEventGroup_1 = require("../../model/transactionEventGroup");
const queueStatus_1 = require("../../model/queueStatus");
const AuthorizationFactory = require("../../factory/authorization");
const TransactionFactory = require("../../factory/transaction");
const TransactionEventFactory = require("../../factory/transactionEvent");
const QueueFactory = require("../../factory/queue");
const EmailFactory = require("../../factory/email");
const OwnerFactory = require("../../factory/owner");
const AssetFactory = require("../../factory/asset");
class TransactionServiceInterpreter {
    createAnonymousOwner() {
        return (repository) => __awaiter(this, void 0, void 0, function* () {
            let owner = OwnerFactory.createAnonymous({
                _id: objectId_1.default()
            });
            yield repository.store(owner);
            return owner;
        });
    }
    updateAnonymousOwner(args) {
        return (repository) => __awaiter(this, void 0, void 0, function* () {
            let option = yield repository.findOneAndUpdate({
                _id: args._id,
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
    getAdministratorOwner() {
        return (repository) => __awaiter(this, void 0, void 0, function* () {
            let option = yield repository.findAdministrator();
            if (option.isEmpty)
                throw new Error("administrator owner not found.");
            return option.get();
        });
    }
    findById(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            return yield transactionRepository.findById(objectId_1.default(args.transaction_id));
        });
    }
    start(args) {
        return (ownerRepository, transactionRepository, queueRepository) => __awaiter(this, void 0, void 0, function* () {
            let owners = [];
            let promises = args.owner_ids.map((ownerId) => __awaiter(this, void 0, void 0, function* () {
                let option = yield ownerRepository.findById(objectId_1.default(ownerId));
                if (option.isEmpty)
                    throw new Error("owner not found.");
                owners.push(option.get());
            }));
            yield Promise.all(promises);
            let event = TransactionEventFactory.create({
                _id: objectId_1.default(),
                group: transactionEventGroup_1.default.START,
            });
            let transaction = TransactionFactory.create({
                _id: objectId_1.default(),
                status: transactionStatus_1.default.PROCESSING,
                events: [event],
                owners: owners,
                expired_at: args.expired_at
            });
            yield transactionRepository.store(transaction);
            let queue = QueueFactory.createExpireTransaction({
                _id: objectId_1.default(),
                transaction_id: transaction._id,
                status: queueStatus_1.default.UNEXECUTED,
                executed_at: transaction.expired_at,
                count_try: 0,
            });
            yield queueRepository.store(queue);
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
                owner_from: optionOwnerFrom.get(),
                owner_to: optionOwnerTo.get(),
                assets: args.seats.map((seat) => {
                    return AssetFactory.createSeatReservation({
                        _id: objectId_1.default(),
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
                authorization: args.authorization,
            });
            let option = yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(args.transaction_id),
                status: transactionStatus_1.default.PROCESSING,
            }, {
                $push: {
                    events: event,
                },
                $addToSet: {
                    authorizations: args.authorization,
                }
            });
            if (option.isEmpty)
                throw new Error("processing transaction not found.");
        });
    }
    removeAuthorization(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = TransactionEventFactory.createUnauthorize({
                _id: objectId_1.default(),
                authorization_id: objectId_1.default(args.authorization_id),
            });
            let option = yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(args.transaction_id),
                status: transactionStatus_1.default.PROCESSING
            }, {
                $push: {
                    events: event,
                },
                $pull: {
                    authorizations: {
                        _id: objectId_1.default(args.authorization_id)
                    },
                }
            });
            if (option.isEmpty)
                throw new Error("processing transaction not found.");
        });
    }
    enableInquiry(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let option = yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(args.transaction_id),
                status: transactionStatus_1.default.PROCESSING
            }, {
                $set: {
                    inquiry_id: args.inquiry_id,
                    inquiry_pass: args.inquiry_pass,
                },
            });
            if (option.isEmpty)
                throw new Error("processing transaction not found.");
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
            transaction.authorizations.forEach((authorization) => {
                queues.push(QueueFactory.createSettleAuthorization({
                    _id: objectId_1.default(),
                    authorization: authorization,
                    status: queueStatus_1.default.UNEXECUTED,
                    executed_at: new Date(),
                    count_try: 0
                }));
            });
            transaction.emails.forEach((email) => {
                queues.push(QueueFactory.createSendEmail({
                    _id: objectId_1.default(),
                    email: email,
                    status: queueStatus_1.default.UNEXECUTED,
                    executed_at: new Date(),
                    count_try: 0
                }));
            });
            let event = TransactionEventFactory.create({
                _id: objectId_1.default(),
                group: transactionEventGroup_1.default.CLOSE,
            });
            let option = yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(args.transaction_id),
                status: transactionStatus_1.default.PROCESSING
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
                throw new Error("processing transaction not found.");
        });
    }
    expire(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let optionTransaction = yield transactionRepository.findById(objectId_1.default(args.transaction_id));
            if (optionTransaction.isEmpty)
                throw new Error("transaction not found.");
            let transaction = optionTransaction.get();
            let queues = [];
            transaction.authorizations.forEach((authorization) => {
                queues.push(QueueFactory.createCancelAuthorization({
                    _id: objectId_1.default(),
                    authorization: authorization,
                    status: queueStatus_1.default.UNEXECUTED,
                    executed_at: new Date(),
                    count_try: 0
                }));
            });
            let event = TransactionEventFactory.create({
                _id: objectId_1.default(),
                group: transactionEventGroup_1.default.EXPIRE,
            });
            yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(args.transaction_id),
                status: transactionStatus_1.default.PROCESSING
            }, {
                $set: {
                    status: transactionStatus_1.default.EXPIRED,
                    queues: queues
                },
                $push: {
                    events: event
                }
            });
        });
    }
    cancel(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = TransactionEventFactory.create({
                _id: objectId_1.default(),
                group: transactionEventGroup_1.default.CANCEL,
            });
            let option = yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(args.transaction_id),
                status: transactionStatus_1.default.CLOSED
            }, {
                $set: {
                    status: transactionStatus_1.default.CANCELED
                },
                $push: {
                    events: event
                }
            });
            if (option.isEmpty)
                throw new Error("closed transaction not found.");
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
            let email = EmailFactory.create({
                _id: objectId_1.default(),
                from: args.from,
                to: args.to,
                subject: args.subject,
                body: args.body,
            });
            let option = yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(args.transaction_id),
                status: transactionStatus_1.default.PROCESSING
            }, {
                $addToSet: {
                    emails: email,
                }
            });
            if (option.isEmpty)
                throw new Error("processing transaction not found.");
            return email;
        });
    }
    removeEmail(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let option = yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(args.transaction_id),
                status: transactionStatus_1.default.PROCESSING
            }, {
                $pull: {
                    emails: {
                        _id: objectId_1.default(args.email_id)
                    },
                }
            });
            if (option.isEmpty)
                throw new Error("processing transaction not found.");
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new TransactionServiceInterpreter();
