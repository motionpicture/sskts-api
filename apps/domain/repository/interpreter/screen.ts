import mongoose = require("mongoose");
import monapt = require("monapt");
import Screen from "../../model/Screen";
import ScreenRepository from "../screen";
import ScreenModel from "./mongoose/model/screen";

namespace interpreter {
    export function createFromDocument(doc: mongoose.Document): Screen {
        return new Screen(
            doc.get("_id"),
            doc.get("theater"),
            doc.get("coa_screen_code"),
            doc.get("name"),
            doc.get("sections")
        );
    }

    export async function findById(id: string) {
        let screen = await ScreenModel.findOne({ _id: id }).exec();
        if (!screen) return monapt.None;

        return monapt.Option(createFromDocument(screen));
    }

    export async function findByTheater(theaterCode: string) {
        let screens = await ScreenModel.find({theater: theaterCode}).exec();
        return screens.map((screen) => {
            return createFromDocument(screen);
        });
    }

    export async function store(screen: Screen) {
        await ScreenModel.findOneAndUpdate({ _id: screen._id }, screen, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}

let i: ScreenRepository = interpreter;
export default i;