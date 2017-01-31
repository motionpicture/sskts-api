import mongoose = require("mongoose");
import monapt = require("monapt");
import Film from "../../model/film";
import FilmRepository from "../film";
import FilmModel from "./mongoose/model/film";
import * as FilmFactory from "../../factory/film";

class FilmRepositoryInterpreter implements FilmRepository {
    public connection: mongoose.Connection;

    async findById(id: string) {
        let model = this.connection.model(FilmModel.modelName, FilmModel.schema);
        let doc = <any>await model.findOne({ _id: id }).lean().exec();

        return (doc) ? monapt.Option(FilmFactory.create(doc)) : monapt.None;
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