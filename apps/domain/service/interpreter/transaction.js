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
const transactionEvent_1 = require("../../model/transactionEvent");
const authorize_1 = require("../../model/transactionEvent/authorize");
const unauthorize_1 = require("../../model/transactionEvent/unauthorize");
const transactionEventGroup_1 = require("../../model/transactionEventGroup");
const transactionStatus_1 = require("../../model/transactionStatus");
const gmo_1 = require("../../model/authorization/gmo");
const coa_1 = require("../../model/authorization/coa");
const TransactionFactory = require("../../factory/transaction");
var interpreter;
(function (interpreter) {
    function start(args) {
        return (ownerRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let owners = [];
            let promises = args.owner_ids.map((ownerId) => __awaiter(this, void 0, void 0, function* () {
                let option = yield ownerRepository.findById(ownerId);
                if (option.isEmpty)
                    throw new Error("owner not found.");
                owners.push(option.get());
            }));
            yield Promise.all(promises);
            let event = new transactionEvent_1.default(mongoose.Types.ObjectId().toString(), transactionEventGroup_1.default.START);
            let transaction = TransactionFactory.create({
                _id: mongoose.Types.ObjectId().toString(),
                status: transactionStatus_1.default.PROCESSING,
                events: [event],
                owners: owners,
                expired_at: args.expired_at
            });
            yield transactionRepository.store(transaction);
            return transaction;
        });
    }
    interpreter.start = start;
    function pushAuthorization(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = new authorize_1.default(mongoose.Types.ObjectId().toString(), args.authorization);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
                status: transactionStatus_1.default.PROCESSING
            }, {
                $set: {},
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
    function addAssetAuthorization(args) {
        return (assetAuthorizationRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let option = yield assetAuthorizationRepository.findById(args.authorization_id);
            if (option.isEmpty)
                throw new Error("authorization not found.");
            yield pushAuthorization({
                transaction_id: args.transaction_id,
                authorization: option.get()
            })(transactionRepository);
            return option.get();
        });
    }
    interpreter.addAssetAuthorization = addAssetAuthorization;
    function addGMOAuthorization(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let authorization = new gmo_1.default(mongoose.Types.ObjectId().toString(), args.gmo_order_id, parseInt(args.gmo_amount));
            yield pushAuthorization({
                transaction_id: args.transaction_id,
                authorization: authorization
            })(transactionRepository);
            return authorization;
        });
    }
    interpreter.addGMOAuthorization = addGMOAuthorization;
    function addCOAAuthorization(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let authorization = new coa_1.default(mongoose.Types.ObjectId().toString(), args.coa_tmp_reserve_num, 1234);
            yield pushAuthorization({
                transaction_id: args.transaction_id,
                authorization: authorization
            })(transactionRepository);
            return authorization;
        });
    }
    interpreter.addCOAAuthorization = addCOAAuthorization;
    function removeAuthorization(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = new unauthorize_1.default(mongoose.Types.ObjectId().toString(), args.authorization_id);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
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
                throw new Error("processing transaction not found.");
        });
    }
    interpreter.removeAuthorization = removeAuthorization;
    function enableInquiry(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let option = yield transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
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
    interpreter.enableInquiry = enableInquiry;
    function close(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = new transactionEvent_1.default(mongoose.Types.ObjectId().toString(), transactionEventGroup_1.default.CLOSE);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
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
    function expire(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = new transactionEvent_1.default(mongoose.Types.ObjectId().toString(), transactionEventGroup_1.default.EXPIRE);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
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
    function cancel(args) {
        return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
            let event = new transactionEvent_1.default(mongoose.Types.ObjectId().toString(), transactionEventGroup_1.default.CANCEL);
            let option = yield transactionRepository.findOneAndUpdate({
                _id: args.transaction_id,
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
