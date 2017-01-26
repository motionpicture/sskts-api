import mongoose = require("mongoose");
import monapt = require("monapt");
import Screen from "../../model/screen";
import ScreenRepository from "../screen";
import * as ScreenFactory from "../../factory/screen";
import ScreenModel from "./mongoose/model/screen";

class ScreenRepositoryInterpreter implements ScreenRepository {
    public connection: mongoose.Connection;

    async findById(id: string) {
        let model = this.connection.model(ScreenModel.modelName, ScreenModel.schema);
        let doc = await model.findOne({ _id: id })
        .populate("theater")
        .exec();
        if (!doc) return monapt.None;

        let screen = ScreenFactory.create({
            _id: doc.get("_id"),
            theater: doc.get("theater"),
            coa_screen_code: doc.get("coa_screen_code"),
            name: doc.get("name"),
            sections: doc.get("sections")
        });

        return monapt.Option(screen);
    }

    async findByTheater(theaterCode: string) {
        let model = this.connection.model(ScreenModel.modelName, ScreenModel.schema);
        let docs = await model.find({theater: theaterCode})
        .populate("theater")
        .exec();
        return docs.map((doc) => {
            return ScreenFactory.create({
                _id: doc.get("_id"),
                theater: doc.get("theater"),
                coa_screen_code: doc.get("coa_screen_code"),
                name: doc.get("name"),
                sections: doc.get("sections")
            });
        });
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