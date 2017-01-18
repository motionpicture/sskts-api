"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const mongoose = require("mongoose");
const Transaction_1 = require("../../model/Transaction");
const TransactionEvent_1 = require("../../model/TransactionEvent");
const TransactionEventGroup_1 = require("../../model/TransactionEventGroup");
const TransactionStatus_1 = require("../../model/TransactionStatus");
const Authorization = require("../../model/Authorization");
var interpreter;
(function (interpreter) {
    function start(expired_at, ownerIds) {
        return (ownerRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let owners = [];
            let promises = ownerIds.map((ownerId) => __awaiter(this, void 0, void 0, function* () {
                let option = yield ownerRepository.findById(ownerId);
                if (option.isEmpty)
                    throw new Error("owner not found.");
                owners.push(option.get());
            }));
            yield Promise.all(promises);
            let event = new TransactionEvent_1.default(mongoose.Types.ObjectId().toString(), TransactionEventGroup_1.default.START, null);
            let transaction = new Transaction_1.default(mongoose.Types.ObjectId().toString(), "password", TransactionStatus_1.default.PROCESSING, [event], owners, expired_at, "", "");
            yield transactionRepository.store(transaction);
            return transaction;
        });
    }
    interpreter.start = start;
    function pushEvent(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let option = yield transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
                password: args.transaction_password,
                status: TransactionStatus_1.default.PROCESSING
            }, {
                $set: {},
                $push: {
                    events: args.event
                }
            });
            if (option.isEmpty)
                throw new Error("processing transaction with given password not found.");
        });
    }
    function addAssetAuthorization(id, authorization) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = new TransactionEvent_1.default(mongoose.Types.ObjectId().toString(), TransactionEventGroup_1.default.START, authorization);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: id,
                status: TransactionStatus_1.default.PROCESSING
            }, {
                $set: {},
                $push: {
                    events: event
                }
            });
            if (option.isEmpty)
                throw new Error("processing transaction not found.");
        });
    }
    interpreter.addAssetAuthorization = addAssetAuthorization;
    function addGMOAuthorization(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let authorization = new Authorization.GMO(mongoose.Types.ObjectId().toString(), args.gmo_order_id);
            let event = new TransactionEvent_1.default(mongoose.Types.ObjectId().toString(), TransactionEventGroup_1.default.AUTHORIZE, authorization);
            yield pushEvent({
                transaction_id: args.transaction_id,
                transaction_password: args.transaction_password,
                event: event
            })(transactionRepository);
        });
    }
    interpreter.addGMOAuthorization = addGMOAuthorization;
    function addCOAAuthorization(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let authorization = new Authorization.COA(mongoose.Types.ObjectId().toString(), args.coa_tmp_reserve_num);
            let event = new TransactionEvent_1.default(mongoose.Types.ObjectId().toString(), TransactionEventGroup_1.default.AUTHORIZE, authorization);
            yield pushEvent({
                transaction_id: args.transaction_id,
                transaction_password: args.transaction_password,
                event: event
            })(transactionRepository);
        });
    }
    interpreter.addCOAAuthorization = addCOAAuthorization;
    function close(id) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = new TransactionEvent_1.default(mongoose.Types.ObjectId().toString(), TransactionEventGroup_1.default.CLOSE, null);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: id,
                status: TransactionStatus_1.default.PROCESSING
            }, {
                $set: {
                    status: TransactionStatus_1.default.CLOSED
                },
                $push: {
                    events: event
                }
            });
            if (option.isEmpty)
                throw new Error("processing transaction not found.");
        });
    }
    interpreter.close = close;
    function expire(id) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = new TransactionEvent_1.default(mongoose.Types.ObjectId().toString(), TransactionEventGroup_1.default.EXPIRE, null);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: id,
                status: TransactionStatus_1.default.PROCESSING
            }, {
                $set: {
                    status: TransactionStatus_1.default.EXPIRED
                },
                $push: {
                    events: event
                }
            });
            if (option.isEmpty)
                throw new Error("processing transaction not found.");
        });
    }
    interpreter.expire = expire;
    function cancel(id) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = new TransactionEvent_1.default(mongoose.Types.ObjectId().toString(), TransactionEventGroup_1.default.CANCEL, null);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: id,
                status: TransactionStatus_1.default.CLOSED
            }, {
                $set: {
                    status: TransactionStatus_1.default.CANCELED
                },
                $push: {
                    events: event
                }
            });
            if (option.isEmpty)
                throw new Error("closed transaction not found.");
        });
    }
    interpreter.cancel = cancel;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
