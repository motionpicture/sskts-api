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
const PerformanceFactory = require("../../factory/performance");
const performance_1 = require("./mongoose/model/performance");
class PerformanceRepositoryInterpreter {
    find(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(performance_1.default.modelName, performance_1.default.schema);
            let performances = yield model.find(conditions)
                .populate("film")
                .populate("theater")
                .populate("screen")
                .exec();
            return performances.map((performance) => {
                return PerformanceFactory.create({
                    _id: performance.get("_id"),
                    theater: performance.get("theater"),
                    screen: performance.get("screen"),
                    film: performance.get("film"),
                    day: performance.get("day"),
                    time_start: performance.get("time_start"),
                    time_end: performance.get("time_end"),
                    canceled: performance.get("canceled"),
                });
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(performance_1.default.modelName, performance_1.default.schema);
            let doc = yield model.findOne({ _id: id })
                .populate("film")
                .populate("theater")
                .populate("screen")
                .exec();
            if (!doc)
                return monapt.None;
            let performance = PerformanceFactory.create({
                _id: doc.get("_id"),
                theater: doc.get("theater"),
                screen: doc.get("screen"),
                film: doc.get("film"),
                day: doc.get("day"),
                time_start: doc.get("time_start"),
                time_end: doc.get("time_end"),
                canceled: doc.get("canceled"),
            });
            return monapt.Option(performance);
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
