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
const transaction_1 = require("./mongoose/model/transaction");
const TransactionFactory = require("../../factory/transaction");
class TransactionRepositoryInterpreter {
    find(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(transaction_1.default.modelName, transaction_1.default.schema);
            let docs = yield model.find()
                .where(conditions)
                .populate("owner")
                .lean()
                .exec();
            return docs.map(TransactionFactory.create);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(transaction_1.default.modelName, transaction_1.default.schema);
            let doc = yield model.findOne()
                .where("_id").equals(id)
                .populate("owners").lean().exec();
            return (doc) ? monapt.Option(TransactionFactory.create(doc)) : monapt.None;
        });
    }
    findOne(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(transaction_1.default.modelName, transaction_1.default.schema);
            let doc = yield model.findOne(conditions).lean().exec();
            return (doc) ? monapt.Option(TransactionFactory.create(doc)) : monapt.None;
        });
    }
    findOneAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(transaction_1.default.modelName, transaction_1.default.schema);
            let doc = yield model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            }).lean().exec();
            return (doc) ? monapt.Option(TransactionFactory.create(doc)) : monapt.None;
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
