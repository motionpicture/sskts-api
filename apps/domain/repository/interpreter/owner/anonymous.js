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
const ownerGroup_1 = require("../../../model/ownerGroup");
const OwnerFactory = require("../../../factory/owner");
const owner_1 = require("../mongoose/model/owner");
var interpreter;
(function (interpreter) {
    function find(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            let docs = yield owner_1.default.find({ $and: [conditions, { group: ownerGroup_1.default.ANONYMOUS }] }).exec();
            return docs.map((doc) => {
                return OwnerFactory.createAnonymous({
                    _id: doc.get("_id"),
                    name_first: doc.get("name_first"),
                    name_last: doc.get("name_last"),
                    email: doc.get("email"),
                    tel: doc.get("tel"),
                });
            });
        });
    }
    interpreter.find = find;
    function findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let doc = yield owner_1.default.findOne({ _id: id, group: ownerGroup_1.default.ANONYMOUS }).exec();
            if (!doc)
                return monapt.None;
            let owner = OwnerFactory.createAnonymous({
                _id: doc.get("_id"),
                name_first: doc.get("name_first"),
                name_last: doc.get("name_last"),
                email: doc.get("email"),
                tel: doc.get("tel"),
            });
            return monapt.Option(owner);
        });
    }
    interpreter.findById = findById;
    function findOneAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let doc = yield owner_1.default.findOneAndUpdate({ $and: [conditions, { group: ownerGroup_1.default.ANONYMOUS }] }, update, {
                new: true,
                upsert: false
            }).exec();
            if (!doc)
                return monapt.None;
            let owner = OwnerFactory.createAnonymous({
                _id: doc.get("_id"),
                name_first: doc.get("name_first"),
                name_last: doc.get("name_last"),
                email: doc.get("email"),
                tel: doc.get("tel"),
            });
            return monapt.Option(owner);
        });
    }
    interpreter.findOneAndUpdate = findOneAndUpdate;
    function store(owner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield owner_1.default.findOneAndUpdate({ _id: owner._id, group: ownerGroup_1.default.ANONYMOUS }, owner, {
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
