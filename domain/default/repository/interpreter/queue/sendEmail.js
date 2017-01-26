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
const QueueFactory = require("../../../factory/queue");
const queueGroup_1 = require("../../../model/queueGroup");
const queue_1 = require("../mongoose/model/queue");
class SendEmailQueueRepositoryInterpreter {
    findOneAndUpdate(conditions, update) {
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
}
let repo = new SendEmailQueueRepositoryInterpreter();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (connection) => {
    repo.connection = connection;
    return repo;
};
