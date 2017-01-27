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
const queueGroup_1 = require("../../model/queueGroup");
const authorizationGroup_1 = require("../../model/authorizationGroup");
const queue_1 = require("./mongoose/model/queue");
class QueueRepositoryInterpreter {
    find(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let docs = yield model.find(conditions).exec();
            yield docs.map((doc) => {
                console.log(doc);
            });
            return [];
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let queue = yield model.findOne({ _id: id }).lean().exec();
            return (queue) ? monapt.Option(queue) : monapt.None;
        });
    }
    findOneAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let queue = yield model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            }).lean().exec();
            return (queue) ? monapt.Option(queue) : monapt.None;
        });
    }
    findOneSendEmailAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let queue = yield model.findOneAndUpdate({
                $and: [
                    { group: queueGroup_1.default.SEND_EMAIL },
                    conditions
                ]
            }, update, {
                new: true,
                upsert: false
            }).lean().exec();
            return (queue) ? monapt.Option(queue) : monapt.None;
        });
    }
    findOneSettleGMOAuthorizationAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let queue = yield model.findOneAndUpdate({
                $and: [
                    {
                        "group": queueGroup_1.default.SETTLE_AUTHORIZATION,
                        "authorization.group": authorizationGroup_1.default.GMO
                    },
                    conditions
                ]
            }, update, {
                new: true,
                upsert: false
            }).lean().exec();
            return (queue) ? monapt.Option(queue) : monapt.None;
        });
    }
    findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let queue = yield model.findOneAndUpdate({
                $and: [
                    {
                        "group": queueGroup_1.default.SETTLE_AUTHORIZATION,
                        "authorization.group": authorizationGroup_1.default.COA_SEAT_RESERVATION
                    },
                    conditions
                ]
            }, update, {
                new: true,
                upsert: false
            }).lean().exec();
            return (queue) ? monapt.Option(queue) : monapt.None;
        });
    }
    findOneCancelGMOAuthorizationAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let queue = yield model.findOneAndUpdate({
                $and: [
                    {
                        "group": queueGroup_1.default.CANCEL_AUTHORIZATION,
                        "authorization.group": authorizationGroup_1.default.GMO
                    },
                    conditions
                ]
            }, update, {
                new: true,
                upsert: false
            }).lean().exec();
            return (queue) ? monapt.Option(queue) : monapt.None;
        });
    }
    findOneExpireTransactionAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let queue = yield model.findOneAndUpdate({
                $and: [
                    { group: queueGroup_1.default.EXPIRE_TRANSACTION },
                    conditions
                ]
            }, update, {
                new: true,
                upsert: false
            }).lean().exec();
            return (queue) ? monapt.Option(queue) : monapt.None;
        });
    }
    store(queue) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            yield model.findOneAndUpdate({ _id: queue._id }, queue, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
}
let repo = new QueueRepositoryInterpreter();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (connection) => {
    repo.connection = connection;
    return repo;
};
