// import mongoose = require("mongoose");
import monapt = require("monapt");
import Screen from "../../model/Screen";
import Film from "../../model/Film";
import Performance from "../../model/Performance";
import PerformanceRepository from "../performance";
import PerformanceModel from "./mongoose/model/performance";
import COA = require("@motionpicture/coa-service");

namespace interpreter {
    // export function createFromDocument(doc: mongoose.Document): Performance {
    //     return new Performance(
    //         doc.get("_id"),
    //         doc.get("theater"),
    //         doc.get("theater_name"),
    //         doc.get("screen"),
    //         doc.get("screen_name"),
    //         doc.get("film"),
    //         doc.get("day"),
    //         doc.get("time_start"),
    //         doc.get("time_end"),
    //         doc.get("canceled")
    //     );
    // }

    export async function find(conditions: Object) {
        let performances = await PerformanceModel.find(conditions)
            .populate("film")
            .populate("theater")
            .populate("screen")
            .exec();

        return performances.map((performance) => {
            return new Performance(
                performance.get("_id"),
                performance.get("theater"),
                performance.get("screen"),
                performance.get("film"),
                performance.get("day"),
                performance.get("time_start"),
                performance.get("time_end"),
                performance.get("canceled")
            )
        });
    }

    export async function findById(id: string) {
        let performance = await PerformanceModel.findOne({ _id: id })
            .populate("film")
            .populate("theater")
            .populate("screen")
            .exec();
        if (!performance) return monapt.None;

        return monapt.Option(new Performance(
            performance.get("_id"),
            performance.get("theater"),
            performance.get("screen"),
            performance.get("film"),
            performance.get("day"),
            performance.get("time_start"),
            performance.get("time_end"),
            performance.get("canceled")
        ));
    }

    export async function store(performance: Performance) {
        await PerformanceModel.findOneAndUpdate({ _id: performance._id }, performance, {
            new: true,
            upsert: true
        }).lean().exec();
    }

    export function storeFromCOA(performanceByCOA: COA.findPerformancesByTheaterCodeInterface.Result) {
        return async (screen: Screen, film: Film) => {
            let id = `${screen.theater._id}${performanceByCOA.date_jouei}${performanceByCOA.title_code}${performanceByCOA.title_branch_num}${performanceByCOA.screen_code}${performanceByCOA.time_begin}`;

            await store(new Performance(
                id,
                screen.theater,
                screen,
                film,
                performanceByCOA.date_jouei,
                performanceByCOA.time_begin,
                performanceByCOA.time_end,
                false
            ));
        }
    }
}

let i: PerformanceRepository = interpreter;
export default i;