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
var interpreter;
(function (interpreter) {
    function find(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            let docs = yield transaction_1.default.find(conditions).exec();
            yield docs.map((doc) => {
                console.log(doc);
            });
            return [];
        });
    }
    interpreter.find = find;
    function findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let doc = yield transaction_1.default.findOne({ _id: id }).exec();
            if (!doc)
                return monapt.None;
            let transaction = TransactionFactory.create({
                _id: doc.get("_id"),
                status: doc.get("status"),
                events: doc.get("events"),
                owners: doc.get("owners"),
                authorizations: doc.get("authorizations"),
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
            let doc = yield transaction_1.default.findOneAndUpdate(conditions, update, {
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
            yield transaction_1.default.findOneAndUpdate({ _id: transaction._id }, transaction, {
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
