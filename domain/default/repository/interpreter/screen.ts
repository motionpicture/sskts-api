import mongoose = require("mongoose");
import monapt = require("monapt");
import Screen from "../../model/screen";
import ScreenRepository from "../screen";
import * as ScreenFactory from "../../factory/screen";
import ScreenModel from "./mongoose/model/screen";

let db = mongoose.createConnection(process.env.MONGOLAB_URI);
let screenModel = db.model(ScreenModel.modelName, ScreenModel.schema);

namespace interpreter {
    export async function findById(id: string) {
        let doc = await screenModel.findOne({ _id: id })
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

    export async function findByTheater(theaterCode: string) {
        let docs = await screenModel.find({theater: theaterCode})
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

    export async function store(screen: Screen) {
        await screenModel.findOneAndUpdate({ _id: screen._id }, screen, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}

let i: ScreenRepository = interpreter;
export default i;