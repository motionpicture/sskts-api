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
const screen_1 = require("../../model/screen");
const screen_2 = require("./mongoose/model/screen");
var interpreter;
(function (interpreter) {
    function createFromDocument(doc) {
        return new screen_1.default(doc.get("_id"), doc.get("theater"), doc.get("coa_screen_code"), doc.get("name"), doc.get("sections"));
    }
    interpreter.createFromDocument = createFromDocument;
    function findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let screen = yield screen_2.default.findOne({ _id: id }).exec();
            if (!screen)
                return monapt.None;
            return monapt.Option(createFromDocument(screen));
        });
    }
    interpreter.findById = findById;
    function findByTheater(theaterCode) {
        return __awaiter(this, void 0, void 0, function* () {
            let screens = yield screen_2.default.find({ theater: theaterCode }).exec();
            return screens.map((screen) => {
                return createFromDocument(screen);
            });
        });
    }
    interpreter.findByTheater = findByTheater;
    function store(screen) {
        return __awaiter(this, void 0, void 0, function* () {
            yield screen_2.default.findOneAndUpdate({ _id: screen._id }, screen, {
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
            yield store(new screen_1.default(`${theater._id}${screenByCOA.screen_code}`, theater, screenByCOA.screen_code, {
                ja: screenByCOA.screen_name,
                en: screenByCOA.screen_name_eng
            }, sections));
        });
    }
    interpreter.storeFromCOA = storeFromCOA;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
