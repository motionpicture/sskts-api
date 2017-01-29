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
const transaction_1 = require("../../model/transaction");
const transaction_2 = require("./mongoose/model/transaction");
class TransactionRepositoryInterpreter {
    createFromDocument(doc) {
        return new transaction_1.default(doc.get("_id"), doc.get("status"), doc.get("events"), doc.get("owners"), doc.get("queues"), doc.get("expired_at"), doc.get("inquiry_id"), doc.get("inquiry_pass"), doc.get("queues_status"));
    }
    find(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(transaction_2.default.modelName, transaction_2.default.schema);
            let docs = yield model.find(conditions)
                .populate("owner")
                .exec();
            return docs.map(this.createFromDocument);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(transaction_2.default.modelName, transaction_2.default.schema);
            let doc = yield model.findOne({ _id: id })
                .populate("owners").exec();
            return (doc) ? monapt.Option(this.createFromDocument(doc)) : monapt.None;
        });
    }
    findOneAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(transaction_2.default.modelName, transaction_2.default.schema);
            let doc = yield model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            }).exec();
            return (doc) ? monapt.Option(this.createFromDocument(doc)) : monapt.None;
        });
    }
    store(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(transaction_2.default.modelName, transaction_2.default.schema);
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
