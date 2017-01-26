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
const ScreenFactory = require("../../factory/screen");
const screen_1 = require("./mongoose/model/screen");
class ScreenRepositoryInterpreter {
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(screen_1.default.modelName, screen_1.default.schema);
            let doc = yield model.findOne({ _id: id })
                .populate("theater")
                .exec();
            if (!doc)
                return monapt.None;
            let screen = ScreenFactory.create({
                _id: doc.get("_id"),
                theater: doc.get("theater"),
                coa_screen_code: doc.get("coa_screen_code"),
                name: doc.get("name"),
                sections: doc.get("sections")
            });
            return monapt.Option(screen);
        });
    }
    findByTheater(theaterCode) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(screen_1.default.modelName, screen_1.default.schema);
            let docs = yield model.find({ theater: theaterCode })
                .populate("theater")
                .exec();
            return docs.map((doc) => {
                return ScreenFactory.create({
                    _id: doc.get("_id"),
                    theater: doc.get("theater"),
                    coa_screen_code: doc.get("coa_screen_code"),
                    name: doc.get("name"),
                    sections: doc.get("sections")
                });
            });
        });
    }
    store(screen) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(screen_1.default.modelName, screen_1.default.schema);
            yield model.findOneAndUpdate({ _id: screen._id }, screen, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
}
let repo = new ScreenRepositoryInterpreter();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (connection) => {
    repo.connection = connection;
    return repo;
};
