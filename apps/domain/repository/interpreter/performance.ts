import Performance from "../../model/Performance";
import PerformanceRepository from "../performance";
import PerformanceModel from "./mongoose/model/performance";

namespace interpreter {
    export function findById(id: string) {
        return new Promise<Performance>((resolve, reject) => {
            PerformanceModel.findOne({ _id: id }).lean().exec().then((performance: Performance) => {
                resolve(performance);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    export function store(performance: Performance) {
        return new Promise<void>((resolve, reject) => {
            console.log("updating performance...");
            PerformanceModel.findOneAndUpdate({_id: performance._id}, performance, {
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