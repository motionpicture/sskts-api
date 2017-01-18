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
            let event = new TransactionEvent_1.default(mongoose.Types.ObjectId().toString(), 1, null);
            let transaction = new Transaction_1.default(mongoose.Types.ObjectId().toString(), "password", 0, [event], owners, expired_at, "", "");
            yield transactionRepository.store(transaction);
            return transaction;
        });
    }
    interpreter.start = start;
    function addAssetAuthorization(id, authorization) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = new TransactionEvent_1.default(mongoose.Types.ObjectId().toString(), 1, authorization);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: id,
                status: 0
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
    function addGMOAuthorization(id, authorization) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = new TransactionEvent_1.default(mongoose.Types.ObjectId().toString(), 1, authorization);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: id,
                status: 0
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
    interpreter.addGMOAuthorization = addGMOAuthorization;
    function addCOAAuthorization(id, authorization) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = new TransactionEvent_1.default(mongoose.Types.ObjectId().toString(), 1, authorization);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: id,
                status: 0
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
    interpreter.addCOAAuthorization = addCOAAuthorization;
    function close(id) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = new TransactionEvent_1.default(mongoose.Types.ObjectId().toString(), 2, null);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: id,
                status: 0
            }, {
                $set: {
                    status: 1
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
            let event = new TransactionEvent_1.default(mongoose.Types.ObjectId().toString(), 3, null);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: id,
                status: 0
            }, {
                $set: {
                    status: 2
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
            let event = new TransactionEvent_1.default(mongoose.Types.ObjectId().toString(), 4, null);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: id,
                status: 1
            }, {
                $set: {
                    status: 3
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
