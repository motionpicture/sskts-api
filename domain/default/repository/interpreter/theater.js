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
const TheaterFactory = require("../../factory/theater");
const theater_1 = require("./mongoose/model/theater");
class TheaterRepositoryInterpreter {
    createFromDocument(doc) {
        return TheaterFactory.create({
            _id: doc.get("_id"),
            name: doc.get("name"),
            name_kana: doc.get("name_kana"),
            address: doc.get("address"),
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(theater_1.default.modelName, theater_1.default.schema);
            let theater = yield model.findOne({ _id: id }).exec();
            if (!theater)
                return monapt.None;
            return monapt.Option(this.createFromDocument(theater));
        });
    }
    store(theater) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(theater_1.default.modelName, theater_1.default.schema);
            yield model.findOneAndUpdate({ _id: theater._id }, theater, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
}
let repo = new TheaterRepositoryInterpreter();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (connection) => {
    repo.connection = connection;
    return repo;
};
