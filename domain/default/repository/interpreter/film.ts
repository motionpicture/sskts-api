import mongoose = require("mongoose");
import monapt = require("monapt");
import Film from "../../model/film";
import FilmRepository from "../film";
import * as FilmFactory from "../../factory/film";
import FilmModel from "./mongoose/model/film";

class FilmRepositoryInterpreter implements FilmRepository {
    public connection: mongoose.Connection;

    private createFromDocument(doc: mongoose.Document): Film {
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

    async findById(id: string) {
        let model = this.connection.model(FilmModel.modelName, FilmModel.schema);
        let film = await model.findOne({ _id: id }).exec();
        if (!film) return monapt.None;

        return monapt.Option(this.createFromDocument(film));
    }

    async store(film: Film) {
        let model = this.connection.model(FilmModel.modelName, FilmModel.schema);
        await model.findOneAndUpdate({ _id: film._id }, film, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}

let repo = new FilmRepositoryInterpreter();

export default (connection: mongoose.Connection) => {
    repo.connection = connection;
    return repo;
}