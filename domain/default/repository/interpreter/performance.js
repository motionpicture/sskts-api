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
const performance_1 = require("./mongoose/model/performance");
class PerformanceRepositoryInterpreter {
    find(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(performance_1.default.modelName, performance_1.default.schema);
            return yield model.find(conditions)
                .populate("film")
                .populate("theater")
                .populate("screen")
                .lean()
                .exec();
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(performance_1.default.modelName, performance_1.default.schema);
            let performance = yield model.findOne({ _id: id })
                .populate("film")
                .populate("theater")
                .populate("screen")
                .lean()
                .exec();
            return (performance) ? monapt.Option(performance) : monapt.None;
        });
    }
    store(performance) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(performance_1.default.modelName, performance_1.default.schema);
            yield model.findOneAndUpdate({ _id: performance._id }, performance, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
}
let repo = new PerformanceRepositoryInterpreter();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (connection) => {
    repo.connection = connection;
    return repo;
};
