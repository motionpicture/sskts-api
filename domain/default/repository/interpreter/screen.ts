import mongoose = require("mongoose");
import monapt = require("monapt");
import Screen from "../../model/screen";
import ScreenRepository from "../screen";
import ScreenModel from "./mongoose/model/screen";

class ScreenRepositoryInterpreter implements ScreenRepository {
    public connection: mongoose.Connection;

    async findById(id: string) {
        let model = this.connection.model(ScreenModel.modelName, ScreenModel.schema);
        let screen = <Screen> await model.findOne({ _id: id })
        .populate("theater")
        .lean()
        .exec();

        return (screen) ? monapt.Option(screen) : monapt.None;
    }

    async findByTheater(theaterCode: string) {
        let model = this.connection.model(ScreenModel.modelName, ScreenModel.schema);
        return <Array<Screen>> await model.find({theater: theaterCode})
        .populate("theater")
        .lean()
        .exec();
    }

    async store(screen: Screen) {
        let model = this.connection.model(ScreenModel.modelName, ScreenModel.schema);
        await model.findOneAndUpdate({ _id: screen._id }, screen, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}

let repo = new ScreenRepositoryInterpreter();

export default (connection: mongoose.Connection) => {
    repo.connection = connection;
    return repo;
}