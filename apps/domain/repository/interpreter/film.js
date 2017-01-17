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
const Film_1 = require("../../model/Film");
const film_1 = require("./mongoose/model/film");
var interpreter;
(function (interpreter) {
    function createFromDocument(doc) {
        return new Film_1.default(doc.get("_id"), doc.get("coa_title_code"), doc.get("coa_title_branch_num"), doc.get("theater"), doc.get("name"), doc.get("name_kana"), doc.get("name_short"), doc.get("name_original"), doc.get("minutes"), doc.get("date_start"), doc.get("date_end"), doc.get("kbn_eirin"), doc.get("kbn_eizou"), doc.get("kbn_joueihousiki"), doc.get("kbn_jimakufukikae"));
    }
    interpreter.createFromDocument = createFromDocument;
    function findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let film = yield film_1.default.findOne({ _id: id }).exec();
            if (!film)
                return monapt.None;
            return monapt.Option(createFromDocument(film));
        });
    }
    interpreter.findById = findById;
    function store(film) {
        return __awaiter(this, void 0, void 0, function* () {
            yield film_1.default.findOneAndUpdate({ _id: film._id }, film, {
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
