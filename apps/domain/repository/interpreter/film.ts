import Film from "../../model/Film";
import FilmRepository from "../film";
import FilmModel from "./mongoose/model/film";

namespace interpreter {
    export function findById(id: string) {
        return new Promise<Film>((resolve, reject) => {
            FilmModel.findOne({ _id: id }).lean().exec().then((film: Film) => {
                resolve(film);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    export function store(film: Film) {
        return new Promise<void>((resolve, reject) => {
            // あれば更新、なければ追加
            console.log("updating film...");
            FilmModel.findOneAndUpdate(
                {
                    _id: film._id
                },
                film,
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

let i: FilmRepository = interpreter;
export default i;