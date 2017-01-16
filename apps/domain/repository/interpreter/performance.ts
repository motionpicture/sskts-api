import mongoose = require("mongoose");
import monapt = require("monapt");
import Performance from "../../model/Performance";
import PerformanceRepository from "../performance";
import PerformanceModel from "./mongoose/model/performance";

namespace interpreter {
    export function createFromDocument(doc: mongoose.Document): Performance {
        return new Performance(
            doc.get("_id"),
            doc.get("theater"),
            doc.get("theater_name"),
            doc.get("screen"),
            doc.get("screen_name"),
            doc.get("film"),
            doc.get("day"),
            doc.get("time_start"),
            doc.get("time_end"),
            doc.get("canceled")
        );
    }

    export async function findById(id: string) {
        let performance = await PerformanceModel.findOne({ _id: id }).exec();
        if (!performance) return monapt.None;

        return monapt.Option(createFromDocument(performance));
    }

    export async function store(performance: Performance) {
        await PerformanceModel.findOneAndUpdate({ _id: performance._id }, performance, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}

let i: PerformanceRepository = interpreter;
export default i;