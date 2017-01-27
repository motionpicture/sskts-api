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
const screen_1 = require("./mongoose/model/screen");
class ScreenRepositoryInterpreter {
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(screen_1.default.modelName, screen_1.default.schema);
            let screen = yield model.findOne({ _id: id })
                .populate("theater")
                .lean()
                .exec();
            return (screen) ? monapt.Option(screen) : monapt.None;
        });
    }
    findByTheater(theaterCode) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(screen_1.default.modelName, screen_1.default.schema);
            return yield model.find({ theater: theaterCode })
                .populate("theater")
                .lean()
                .exec();
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
