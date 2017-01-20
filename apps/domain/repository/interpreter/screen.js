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
var interpreter;
(function (interpreter) {
    function findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let doc = yield screen_1.default.findOne({ _id: id })
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
    interpreter.findById = findById;
    function findByTheater(theaterCode) {
        return __awaiter(this, void 0, void 0, function* () {
            let docs = yield screen_1.default.find({ theater: theaterCode })
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
    interpreter.findByTheater = findByTheater;
    function store(screen) {
        return __awaiter(this, void 0, void 0, function* () {
            yield screen_1.default.findOneAndUpdate({ _id: screen._id }, screen, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
    interpreter.store = store;
    function storeFromCOA(screenByCOA) {
        return (theater) => __awaiter(this, void 0, void 0, function* () {
            let sections = [];
            let sectionCodes = [];
            screenByCOA.list_seat.forEach((seat) => {
                if (sectionCodes.indexOf(seat.seat_section) < 0) {
                    sectionCodes.push(seat.seat_section);
                    sections.push({
                        code: seat.seat_section,
                        name: {
                            ja: `セクション${seat.seat_section}`,
                            en: `section${seat.seat_section}`,
                        },
                        seats: []
                    });
                }
                sections[sectionCodes.indexOf(seat.seat_section)].seats.push({
                    code: seat.seat_num
                });
            });
            let screen = ScreenFactory.create({
                _id: `${theater._id}${screenByCOA.screen_code}`,
                theater: theater,
                coa_screen_code: screenByCOA.screen_code,
                name: {
                    ja: screenByCOA.screen_name,
                    en: screenByCOA.screen_name_eng
                },
                sections: sections
            });
            yield store(screen);
        });
    }
    interpreter.storeFromCOA = storeFromCOA;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
