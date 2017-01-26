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
const TransactionFactory = require("../../factory/transaction");
const transaction_1 = require("./mongoose/model/transaction");
class TransactionRepositoryInterpreter {
    createFromDocument(doc) {
        return TransactionFactory.create({
            _id: doc.get("_id"),
            status: doc.get("status"),
            events: doc.get("events"),
            owners: doc.get("owners"),
            authorizations: doc.get("authorizations"),
            emails: doc.get("emails"),
            queues: doc.get("queues"),
            expired_at: doc.get("expired_at"),
            inquiry_id: doc.get("inquiry_id"),
            inquiry_pass: doc.get("inquiry_pass"),
            queues_status: doc.get("queues_status"),
        });
    }
    find(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(transaction_1.default.modelName, transaction_1.default.schema);
            let docs = yield model.find(conditions)
                .populate("owner").exec();
            yield docs.map((doc) => {
                console.log(doc);
            });
            return [];
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(transaction_1.default.modelName, transaction_1.default.schema);
            let doc = yield model.findOne({ _id: id })
                .populate("owners").exec();
            if (!doc)
                return monapt.None;
            return monapt.Option(this.createFromDocument(doc));
        });
    }
    findOneAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(transaction_1.default.modelName, transaction_1.default.schema);
            let doc = yield model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            }).exec();
            if (!doc)
                return monapt.None;
            return monapt.Option(this.createFromDocument(doc));
        });
    }
    store(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(transaction_1.default.modelName, transaction_1.default.schema);
            yield model.findOneAndUpdate({ _id: transaction._id }, transaction, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
}
let repo = new TransactionRepositoryInterpreter();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (connection) => {
    repo.connection = connection;
    return repo;
};
