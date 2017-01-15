import Theater from "../../model/Theater";
import TheaterRepository from "../theater";
import TheaterModel from "./mongoose/model/theater";

namespace interpreter {
    export function findById(id: string) {
        return new Promise<Theater>((resolve: (result: Theater) => void, reject: (err: Error) => void) => {
            TheaterModel.findOne({ _id: id }).lean().exec().then((theater: Theater) => {
                resolve(theater);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    export function store(theater: Theater) {
        return new Promise<void>((resolve, reject) => {
            // あれば更新、なければ追加
            console.log("updating theater...");
            TheaterModel.findOneAndUpdate(
                {
                    _id: theater._id
                },
                theater,
                {
                    new: true,
                    upsert: true
                }).lean().exec().then(() => {
                    console.log("screen updated.");
                    resolve();
                }).catch((err) => {
                    reject(err)
                });
        });
    }
}

let i: TheaterRepository = interpreter;
export default i;