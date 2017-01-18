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
const transaction_1 = require("../../model/transaction");
const transactionEvent_1 = require("../../model/transactionEvent");
const transactionEventGroup_1 = require("../../model/transactionEventGroup");
const transactionStatus_1 = require("../../model/transactionStatus");
const authorization_1 = require("../../model/authorization");
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
            let event = new transactionEvent_1.default(mongoose.Types.ObjectId().toString(), transactionEventGroup_1.default.START);
            let transaction = new transaction_1.default(mongoose.Types.ObjectId().toString(), "password", transactionStatus_1.default.PROCESSING, [event], owners, [], expired_at, "", "");
            yield transactionRepository.store(transaction);
            return transaction;
        });
    }
    interpreter.start = start;
    function pushAuthorization(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = new transactionEvent_1.Authorize(mongoose.Types.ObjectId().toString(), args.authorization);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
                password: args.transaction_password,
                status: transactionStatus_1.default.PROCESSING
            }, {
                $set: {},
                $push: {
                    events: event,
                    authorizations: args.authorization,
                }
            });
            if (option.isEmpty)
                throw new Error("processing transaction with given password not found.");
        });
    }
    function addAssetAuthorization(id, authorization) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = new transactionEvent_1.Authorize(mongoose.Types.ObjectId().toString(), authorization);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: id,
                status: transactionStatus_1.default.PROCESSING
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
            let authorization = new authorization_1.GMO(mongoose.Types.ObjectId().toString(), args.gmo_order_id);
            yield pushAuthorization({
                transaction_id: args.transaction_id,
                transaction_password: args.transaction_password,
                authorization: authorization
            })(transactionRepository);
            return authorization;
        });
    }
    interpreter.addGMOAuthorization = addGMOAuthorization;
    function addCOAAuthorization(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let authorization = new authorization_1.COA(mongoose.Types.ObjectId().toString(), args.coa_tmp_reserve_num);
            yield pushAuthorization({
                transaction_id: args.transaction_id,
                transaction_password: args.transaction_password,
                authorization: authorization
            })(transactionRepository);
            return authorization;
        });
    }
    interpreter.addCOAAuthorization = addCOAAuthorization;
    function removeAuthorization(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = new transactionEvent_1.Unauthoriza(mongoose.Types.ObjectId().toString(), args.authorization_id);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
                password: args.transaction_password,
                status: transactionStatus_1.default.PROCESSING
            }, {
                $set: {},
                $push: {
                    events: event,
                },
                $pull: {
                    authorizations: {
                        _id: args.authorization_id
                    },
                }
            });
            if (option.isEmpty)
                throw new Error("processing transaction with given password not found.");
        });
    }
    interpreter.removeAuthorization = removeAuthorization;
    function close(id) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = new transactionEvent_1.default(mongoose.Types.ObjectId().toString(), transactionEventGroup_1.default.CLOSE);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: id,
                status: transactionStatus_1.default.PROCESSING
            }, {
                $set: {
                    status: transactionStatus_1.default.CLOSED
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
            let event = new transactionEvent_1.default(mongoose.Types.ObjectId().toString(), transactionEventGroup_1.default.EXPIRE);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: id,
                status: transactionStatus_1.default.PROCESSING
            }, {
                $set: {
                    status: transactionStatus_1.default.EXPIRED
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
            let event = new transactionEvent_1.default(mongoose.Types.ObjectId().toString(), transactionEventGroup_1.default.CANCEL);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: id,
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
    interpreter.cancel = cancel;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
