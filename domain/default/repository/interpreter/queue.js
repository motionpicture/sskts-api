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
const notificationGroup_1 = require("../../model/notificationGroup");
const QueueFactory = require("../../factory/queue");
const queue_1 = require("./mongoose/model/queue");
class QueueRepositoryInterpreter {
    find(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let docs = yield model.find().where(conditions).exec();
            yield docs.map((doc) => {
                console.log(doc);
            });
            return [];
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let doc = yield model.findOne()
                .where("_id").equals(id).lean().exec();
            return (doc) ? monapt.Option(QueueFactory.create(doc)) : monapt.None;
        });
    }
    findOneAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let doc = yield model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            }).lean().exec();
            return (doc) ? monapt.Option(QueueFactory.create(doc)) : monapt.None;
        });
    }
    findOneSendEmailAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let doc = yield model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            })
                .where({
                "group": queueGroup_1.default.PUSH_NOTIFICATION,
                "notification.group": notificationGroup_1.default.EMAIL
            }).lean().exec();
            return (doc) ? monapt.Option(QueueFactory.createPushNotification(doc)) : monapt.None;
        });
    }
    findOneSettleGMOAuthorizationAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let doc = yield model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            })
                .where({
                "group": queueGroup_1.default.SETTLE_AUTHORIZATION,
                "authorization.group": authorizationGroup_1.default.GMO
            })
                .lean().exec();
            return (doc) ? monapt.Option(QueueFactory.createSettleAuthorization(doc)) : monapt.None;
        });
    }
    findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let doc = yield model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            })
                .where({
                "group": queueGroup_1.default.SETTLE_AUTHORIZATION,
                "authorization.group": authorizationGroup_1.default.COA_SEAT_RESERVATION
            })
                .lean().exec();
            return (doc) ? monapt.Option(QueueFactory.createSettleAuthorization(doc)) : monapt.None;
        });
    }
    findOneCancelGMOAuthorizationAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let doc = yield model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            })
                .where({
                "group": queueGroup_1.default.CANCEL_AUTHORIZATION,
                "authorization.group": authorizationGroup_1.default.GMO
            })
                .lean().exec();
            return (doc) ? monapt.Option(QueueFactory.createCancelAuthorization(doc)) : monapt.None;
        });
    }
    findOneCancelCOASeatReservationAuthorizationAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let doc = yield model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            })
                .where({
                "group": queueGroup_1.default.CANCEL_AUTHORIZATION,
                "authorization.group": authorizationGroup_1.default.COA_SEAT_RESERVATION
            })
                .lean().exec();
            return (doc) ? monapt.Option(QueueFactory.createCancelAuthorization(doc)) : monapt.None;
        });
    }
    findOneDisableTransactionInquiryAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let doc = yield model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            })
                .where({
                "group": queueGroup_1.default.DISABLE_TRANSACTION_INQUIRY,
            })
                .lean().exec();
            return (doc) ? monapt.Option(QueueFactory.createDisableTransactionInquiry(doc)) : monapt.None;
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
