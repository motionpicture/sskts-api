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
const FilmFactory = require("../../factory/film");
const film_1 = require("./mongoose/model/film");
class FilmRepositoryInterpreter {
    createFromDocument(doc) {
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
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(film_1.default.modelName, film_1.default.schema);
            let film = yield model.findOne({ _id: id }).exec();
            if (!film)
                return monapt.None;
            return monapt.Option(this.createFromDocument(film));
        });
    }
    store(film) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(film_1.default.modelName, film_1.default.schema);
            yield model.findOneAndUpdate({ _id: film._id }, film, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
}
let repo = new FilmRepositoryInterpreter();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (connection) => {
    repo.connection = connection;
    return repo;
};
