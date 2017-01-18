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
const performance_1 = require("../../model/performance");
const performance_2 = require("./mongoose/model/performance");
var interpreter;
(function (interpreter) {
    function find(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            let performances = yield performance_2.default.find(conditions)
                .populate("film")
                .populate("theater")
                .populate("screen")
                .exec();
            return performances.map((performance) => {
                return new performance_1.default(performance.get("_id"), performance.get("theater"), performance.get("screen"), performance.get("film"), performance.get("day"), performance.get("time_start"), performance.get("time_end"), performance.get("canceled"));
            });
        });
    }
    interpreter.find = find;
    function findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let performance = yield performance_2.default.findOne({ _id: id })
                .populate("film")
                .populate("theater")
                .populate("screen")
                .exec();
            if (!performance)
                return monapt.None;
            return monapt.Option(new performance_1.default(performance.get("_id"), performance.get("theater"), performance.get("screen"), performance.get("film"), performance.get("day"), performance.get("time_start"), performance.get("time_end"), performance.get("canceled")));
        });
    }
    interpreter.findById = findById;
    function store(performance) {
        return __awaiter(this, void 0, void 0, function* () {
            yield performance_2.default.findOneAndUpdate({ _id: performance._id }, performance, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
    interpreter.store = store;
    function storeFromCOA(performanceByCOA) {
        return (screen, film) => __awaiter(this, void 0, void 0, function* () {
            let id = `${screen.theater._id}${performanceByCOA.date_jouei}${performanceByCOA.title_code}${performanceByCOA.title_branch_num}${performanceByCOA.screen_code}${performanceByCOA.time_begin}`;
            yield store(new performance_1.default(id, screen.theater, screen, film, performanceByCOA.date_jouei, performanceByCOA.time_begin, performanceByCOA.time_end, false));
        });
    }
    interpreter.storeFromCOA = storeFromCOA;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
