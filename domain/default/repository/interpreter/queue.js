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
const AuthorizationFactory = require("../../factory/authorization");
const QueueFactory = require("../../factory/queue");
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
            let doc = yield model.findOne({ _id: id }).exec();
            if (!doc)
                return monapt.None;
            return monapt.None;
        });
    }
    findOneAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let doc = yield model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            }).exec();
            if (!doc)
                return monapt.None;
            return monapt.Option(QueueFactory.create({
                _id: doc.get("_id"),
                group: doc.get("group"),
                status: doc.get("status"),
                executed_at: doc.get("executed_at"),
                count_try: doc.get("count_try")
            }));
        });
    }
    findOneSendEmailAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let doc = yield model.findOneAndUpdate({
                $and: [
                    { group: queueGroup_1.default.SEND_EMAIL },
                    conditions
                ]
            }, update, {
                new: true,
                upsert: false
            }).exec();
            if (!doc)
                return monapt.None;
            return monapt.Option(QueueFactory.createSendEmail({
                _id: doc.get("_id"),
                email: doc.get("email"),
                status: doc.get("status"),
                executed_at: doc.get("executed_at"),
                count_try: doc.get("count_try")
            }));
        });
    }
    findOneSettleGMOAuthorizationAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let doc = yield model.findOneAndUpdate({
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
            }).exec();
            if (!doc)
                return monapt.None;
            let authorization = AuthorizationFactory.createGMO({
                _id: doc.get("authorization")._id,
                price: doc.get("authorization").price,
                owner_from: doc.get("authorization").owner_from,
                owner_to: doc.get("authorization").owner_to,
                gmo_shop_id: doc.get("authorization").gmo_shop_id,
                gmo_shop_pass: doc.get("authorization").gmo_shop_pass,
                gmo_order_id: doc.get("authorization").gmo_order_id,
                gmo_amount: doc.get("authorization").gmo_amount,
                gmo_access_id: doc.get("authorization").gmo_access_id,
                gmo_access_pass: doc.get("authorization").gmo_access_pass,
                gmo_job_cd: doc.get("authorization").gmo_job_cd,
                gmo_pay_type: doc.get("authorization").gmo_pay_type,
            });
            return monapt.Option({
                _id: doc.get("_id"),
                authorization: authorization
            });
        });
    }
    findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(queue_1.default.modelName, queue_1.default.schema);
            let doc = yield model.findOneAndUpdate({
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
            }).exec();
            if (!doc)
                return monapt.None;
            let authorization = AuthorizationFactory.createCOASeatReservation({
                _id: doc.get("authorization")._id,
                coa_tmp_reserve_num: doc.get("authorization").coa_tmp_reserve_num,
                price: doc.get("authorization").price,
                owner_from: doc.get("authorization").owner_from,
                owner_to: doc.get("authorization").owner_to,
                seats: doc.get("authorization").seats,
            });
            return monapt.Option({
                _id: doc.get("_id"),
                authorization: authorization
            });
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
