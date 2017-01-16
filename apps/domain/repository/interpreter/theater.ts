import monapt = require("monapt");
import Theater from "../../model/Theater";
import TheaterRepository from "../theater";
import TheaterModel from "./mongoose/model/theater";

namespace interpreter {
    export function findById(id: string) {
        return new Promise<monapt.Option<Theater>>((resolve, reject) => {
            TheaterModel.findOne({ _id: id }).exec().then((theater) => {
                if (!theater) return resolve(monapt.None);

                resolve(monapt.Option(new Theater(
                    theater.get("_id"),
                    theater.get("name"),
                    theater.get("name_kana"),
                    theater.get("address"),
                )));
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