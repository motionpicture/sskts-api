import mongoose = require("mongoose");
import monapt = require("monapt");
import Theater from "../../model/theater";
import TheaterRepository from "../theater";
import TheaterModel from "./mongoose/model/theater";

class TheaterRepositoryInterpreter implements TheaterRepository {
    public connection: mongoose.Connection;

    async findById(id: string) {
        let model = this.connection.model(TheaterModel.modelName, TheaterModel.schema);
        let theater = <Theater> await model.findOne({ _id: id }).lean().exec();

        return (theater) ? monapt.Option(theater) : monapt.None;
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