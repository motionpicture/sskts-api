"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const mongoose = require("mongoose");
const monapt = require("monapt");
const PerformanceFactory = require("../../factory/performance");
const performance_1 = require("./mongoose/model/performance");
let db = mongoose.createConnection(process.env.MONGOLAB_URI);
let performanceModel = db.model(performance_1.default.modelName, performance_1.default.schema);
var interpreter;
(function (interpreter) {
    function find(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            let performances = yield performanceModel.find(conditions)
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
    interpreter.find = find;
    function findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let doc = yield performanceModel.findOne({ _id: id })
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
    interpreter.findById = findById;
    function store(performance) {
        return __awaiter(this, void 0, void 0, function* () {
            yield performanceModel.findOneAndUpdate({ _id: performance._id }, performance, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
    interpreter.store = store;
    function storeFromCOA(performanceByCOA) {
        return (screen, film) => __awaiter(this, void 0, void 0, function* () {
            let id = `${screen.theater._id}${performanceByCOA.date_jouei}${performanceByCOA.title_code}${performanceByCOA.title_branch_num}${performanceByCOA.screen_code}${performanceByCOA.time_begin}`;
            let performance = PerformanceFactory.create({
                _id: id,
                theater: screen.theater,
                screen: screen,
                film: film,
                day: performanceByCOA.date_jouei,
                time_start: performanceByCOA.time_begin,
                time_end: performanceByCOA.time_end,
                canceled: false,
            });
            yield store(performance);
        });
    }
    interpreter.storeFromCOA = storeFromCOA;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
