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
const TheaterFactory = require("../../factory/theater");
const theater_1 = require("./mongoose/model/theater");
let db = mongoose.createConnection(process.env.MONGOLAB_URI);
let theaterModel = db.model(theater_1.default.modelName, theater_1.default.schema);
var interpreter;
(function (interpreter) {
    function createFromDocument(doc) {
        return TheaterFactory.create({
            _id: doc.get("_id"),
            name: doc.get("name"),
            name_kana: doc.get("name_kana"),
            address: doc.get("address"),
        });
    }
    function findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let theater = yield theaterModel.findOne({ _id: id }).exec();
            if (!theater)
                return monapt.None;
            return monapt.Option(createFromDocument(theater));
        });
    }
    interpreter.findById = findById;
    function store(theater) {
        return __awaiter(this, void 0, void 0, function* () {
            yield theaterModel.findOneAndUpdate({ _id: theater._id }, theater, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
    interpreter.store = store;
    function storeFromCOA(theaterByCOA) {
        return __awaiter(this, void 0, void 0, function* () {
            let theater = TheaterFactory.create({
                _id: theaterByCOA.theater_code,
                name: {
                    ja: theaterByCOA.theater_name,
                    en: theaterByCOA.theater_name_eng,
                },
                name_kana: theaterByCOA.theater_name_kana,
                address: {
                    ja: "",
                    en: "",
                },
            });
            yield store(theater);
        });
    }
    interpreter.storeFromCOA = storeFromCOA;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
