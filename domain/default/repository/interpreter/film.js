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
const FilmFactory = require("../../factory/film");
const film_1 = require("./mongoose/model/film");
let db = mongoose.createConnection(process.env.MONGOLAB_URI);
let filmModel = db.model(film_1.default.modelName, film_1.default.schema);
var interpreter;
(function (interpreter) {
    function createFromDocument(doc) {
        return FilmFactory.create({
            _id: doc.get("_id"),
            coa_title_code: doc.get("coa_title_code"),
            coa_title_branch_num: doc.get("coa_title_branch_num"),
            theater: doc.get("theater"),
            name: doc.get("name"),
            name_kana: doc.get("name_kana"),
            name_short: doc.get("name_short"),
            name_original: doc.get("name_original"),
            minutes: doc.get("minutes"),
            date_start: doc.get("date_start"),
            date_end: doc.get("date_end"),
            kbn_eirin: doc.get("kbn_eirin"),
            kbn_eizou: doc.get("kbn_eizou"),
            kbn_joueihousiki: doc.get("kbn_joueihousiki"),
            kbn_jimakufukikae: doc.get("kbn_jimakufukikae")
        });
    }
    interpreter.createFromDocument = createFromDocument;
    function findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let film = yield filmModel.findOne({ _id: id }).exec();
            if (!film)
                return monapt.None;
            return monapt.Option(createFromDocument(film));
        });
    }
    interpreter.findById = findById;
    function store(film) {
        return __awaiter(this, void 0, void 0, function* () {
            yield filmModel.findOneAndUpdate({ _id: film._id }, film, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
    interpreter.store = store;
    function storeFromCOA(filmByCOA) {
        return (theater) => __awaiter(this, void 0, void 0, function* () {
            let film = FilmFactory.create({
                _id: `${theater._id}${filmByCOA.title_code}${filmByCOA.title_branch_num}`,
                coa_title_code: filmByCOA.title_code,
                coa_title_branch_num: filmByCOA.title_branch_num,
                theater: theater,
                name: {
                    ja: filmByCOA.title_name,
                    en: filmByCOA.title_name_eng
                },
                name_kana: filmByCOA.title_name_kana,
                name_short: filmByCOA.title_name_short,
                name_original: filmByCOA.title_name_orig,
                minutes: filmByCOA.show_time,
                date_start: filmByCOA.date_begin,
                date_end: filmByCOA.date_end,
                kbn_eirin: filmByCOA.kbn_eirin,
                kbn_eizou: filmByCOA.kbn_eizou,
                kbn_joueihousiki: filmByCOA.kbn_joueihousiki,
                kbn_jimakufukikae: filmByCOA.kbn_jimakufukikae
            });
            yield store(film);
        });
    }
    interpreter.storeFromCOA = storeFromCOA;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
