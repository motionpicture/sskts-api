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
const Theater_1 = require("../../model/Theater");
const theater_1 = require("./mongoose/model/theater");
var interpreter;
(function (interpreter) {
    function createFromDocument(doc) {
        return new Theater_1.default(doc.get("_id"), doc.get("name"), doc.get("name_kana"), doc.get("address"));
    }
    function findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let theater = yield theater_1.default.findOne({ _id: id }).exec();
            if (!theater)
                return monapt.None;
            return monapt.Option(createFromDocument(theater));
        });
    }
    interpreter.findById = findById;
    function store(theater) {
        return __awaiter(this, void 0, void 0, function* () {
            yield theater_1.default.findOneAndUpdate({ _id: theater._id }, theater, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
    interpreter.store = store;
    function storeFromCOA(theaterByCOA) {
        return __awaiter(this, void 0, void 0, function* () {
            yield store(new Theater_1.default(theaterByCOA.theater_code, {
                ja: theaterByCOA.theater_name,
                en: theaterByCOA.theater_name_eng,
            }, theaterByCOA.theater_name_kana, {
                ja: "",
                en: "",
            }));
        });
    }
    interpreter.storeFromCOA = storeFromCOA;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
