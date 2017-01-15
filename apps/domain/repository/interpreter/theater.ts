import Theater from "../../model/Theater";
import TheaterRepository from "../theater";
import * as TheaterModel from "../../../common/models/theater";

namespace interpreter {
    export function findById(id: string) {
        return new Promise<Theater>((resolve: (result: Theater) => void, reject: (err: Error) => void) => {
            TheaterModel.default.findOne({
                _id: id
            }).lean().exec((err, theater: Theater) => {
                if (err) return reject(err);
                if (!theater) return reject(new Error("not found."));

                resolve(theater);
            })
        });
    }

    export function store(theater: Theater) {
        return new Promise<void>((resolve, reject) => {
            // あれば更新、なければ追加
            console.log("updating theater...");
            TheaterModel.default.findOneAndUpdate(
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