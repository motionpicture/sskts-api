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
const monapt = require("monapt");
const TransactionFactory = require("../../factory/transaction");
const transaction_1 = require("./mongoose/model/transaction");
let db = mongoose.createConnection(process.env.MONGOLAB_URI);
let transactionModel = db.model(transaction_1.default.modelName, transaction_1.default.schema);
var interpreter;
(function (interpreter) {
    function find(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            let docs = yield transactionModel.find(conditions)
                .populate("owner").exec();
            yield docs.map((doc) => {
                console.log(doc);
            });
            return [];
        });
    }
    interpreter.find = find;
    function findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let doc = yield transactionModel.findOne({ _id: id })
                .populate("owners").exec();
            if (!doc)
                return monapt.None;
            let transaction = TransactionFactory.create({
                _id: doc.get("_id"),
                status: doc.get("status"),
                events: doc.get("events"),
                owners: doc.get("owners"),
                authorizations: doc.get("authorizations"),
                emails: doc.get("emails"),
                expired_at: doc.get("expired_at"),
                inquiry_id: doc.get("inquiry_id"),
                inquiry_pass: doc.get("inquiry_pass"),
                queues_imported: doc.get("queues_imported"),
            });
            return monapt.Option(transaction);
        });
    }
    interpreter.findById = findById;
    function findOneAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let doc = yield transactionModel.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            }).exec();
            if (!doc)
                return monapt.None;
            return monapt.Option(TransactionFactory.create({
                _id: doc.get("_id"),
                status: doc.get("status"),
                events: doc.get("events"),
                owners: doc.get("owners"),
                authorizations: doc.get("authorizations"),
                expired_at: doc.get("expired_at"),
                inquiry_id: doc.get("inquiry_id"),
                inquiry_pass: doc.get("inquiry_pass"),
            }));
        });
    }
    interpreter.findOneAndUpdate = findOneAndUpdate;
    function store(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield transactionModel.findOneAndUpdate({ _id: transaction._id }, transaction, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
    interpreter.store = store;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
