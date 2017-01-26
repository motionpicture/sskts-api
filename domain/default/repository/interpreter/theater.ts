import mongoose = require("mongoose");
import monapt = require("monapt");
import Theater from "../../model/theater";
import * as TheaterFactory from "../../factory/theater";
import TheaterRepository from "../theater";
import TheaterModel from "./mongoose/model/theater";

class TheaterRepositoryInterpreter implements TheaterRepository {
    public connection: mongoose.Connection;

    private createFromDocument(doc: mongoose.Document): Theater {
        return TheaterFactory.create({
            _id: doc.get("_id"),
            name: doc.get("name"),
            name_kana: doc.get("name_kana"),
            address: doc.get("address"),
        });
    }

    async findById(id: string) {
        let model = this.connection.model(TheaterModel.modelName, TheaterModel.schema);
        let theater = await model.findOne({ _id: id }).exec();
        if (!theater) return monapt.None;

        return monapt.Option(this.createFromDocument(theater));
    }

    async store(theater: Theater) {
        let model = this.connection.model(TheaterModel.modelName, TheaterModel.schema);
        await model.findOneAndUpdate({ _id: theater._id }, theater, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}

let repo = new TheaterRepositoryInterpreter();

export default (connection: mongoose.Connection) => {
    repo.connection = connection;
    return repo;
}