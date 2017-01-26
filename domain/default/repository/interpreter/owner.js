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
const OwnerFactory = require("../../factory/owner");
const ownerGroup_1 = require("../../model/ownerGroup");
const owner_1 = require("./mongoose/model/owner");
class OwnerRepositoryInterpreter {
    find(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(owner_1.default.modelName, owner_1.default.schema);
            let docs = yield model.find({ $and: [conditions] }).exec();
            return docs.map((doc) => {
                return OwnerFactory.create({
                    _id: doc.get("_id"),
                    group: doc.get("group")
                });
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(owner_1.default.modelName, owner_1.default.schema);
            let doc = yield model.findOne({ _id: id }).exec();
            if (!doc)
                return monapt.None;
            let owner;
            switch (doc.get("group")) {
                case ownerGroup_1.default.ANONYMOUS:
                    owner = OwnerFactory.createAnonymous({
                        _id: doc.get("_id"),
                        name_first: doc.get("name_first"),
                        name_last: doc.get("name_last"),
                        email: doc.get("email"),
                        tel: doc.get("tel"),
                    });
                    break;
                default:
                    owner = OwnerFactory.create({
                        _id: doc.get("_id"),
                        group: doc.get("group")
                    });
                    break;
            }
            return monapt.Option(owner);
        });
    }
    findOneAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(owner_1.default.modelName, owner_1.default.schema);
            let doc = yield model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            }).exec();
            if (!doc)
                return monapt.None;
            let owner = OwnerFactory.create({
                _id: doc.get("_id"),
                group: doc.get("group")
            });
            return monapt.Option(owner);
        });
    }
    store(owner) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(owner_1.default.modelName, owner_1.default.schema);
            yield model.findOneAndUpdate({ _id: owner._id }, owner, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
}
let repo = new OwnerRepositoryInterpreter();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (connection) => {
    repo.connection = connection;
    return repo;
};
