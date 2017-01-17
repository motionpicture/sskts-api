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
const Performance_1 = require("../../model/Performance");
const performance_1 = require("./mongoose/model/performance");
var interpreter;
(function (interpreter) {
    function find() {
        return __awaiter(this, void 0, void 0, function* () {
            let performances = yield performance_1.default.find({}).exec();
            return performances.map((performance) => {
                return new Performance_1.default(performance.get("_id"), performance.get("theater"), performance.get("screen"), performance.get("film"), performance.get("day"), performance.get("time_start"), performance.get("time_end"), performance.get("canceled"));
            });
        });
    }
    interpreter.find = find;
    function findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let performance = yield performance_1.default.findOne({ _id: id })
                .populate("film")
                .populate("theater", "_id name")
                .populate("screen", "_id name")
                .exec();
            if (!performance)
                return monapt.None;
            return monapt.Option(new Performance_1.default(performance.get("_id"), performance.get("theater"), performance.get("screen"), performance.get("film"), performance.get("day"), performance.get("time_start"), performance.get("time_end"), performance.get("canceled")));
        });
    }
    interpreter.findById = findById;
    function store(performance) {
        return __awaiter(this, void 0, void 0, function* () {
            yield performance_1.default.findOneAndUpdate({ _id: performance._id }, performance, {
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
