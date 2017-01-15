import Performance from "../../model/Performance";
import PerformanceRepository from "../performance";
import * as PerformanceModel from "../../../common/models/performance";

namespace interpreter {
    export function findById(id: string) {
        return new Promise<Performance>((resolve, reject) => {
            reject(new Error("now coding..."));
        });
    }

    export function store(performance: Performance) {
        return new Promise<void>((resolve, reject) => {
            console.log("updating performance...");
            PerformanceModel.default.findOneAndUpdate({_id: performance._id}, performance, {
                new: true,
                upsert: true,
            }).lean().exec().then(() => {
                console.log("performance updated.");
                resolve();
            }).catch((err) => {
                reject(err)
            });
        });
    }
}

let i: PerformanceRepository = interpreter;
export default i;