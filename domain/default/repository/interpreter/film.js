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
const film_1 = require("./mongoose/model/film");
class FilmRepositoryInterpreter {
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.connection.model(film_1.default.modelName, film_1.default.schema);
            let film = yield model.findOne({ _id: id }).lean().exec();
            return (film) ? monapt.Option(film) : monapt.None;
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
