import Film from "../../model/Film";
import FilmRepository from "../film";
import * as FilmModel from "../../../common/models/film";

namespace interpreter {
    export function find(id: string) {
        return new Promise<Film>((resolve, reject) => {
            reject(new Error("now coding..."));
        });
    }

    export function store(film: Film) {
        return new Promise<void>((resolve, reject) => {
            // あれば更新、なければ追加
            console.log("updating film...");
            FilmModel.default.findOneAndUpdate(
                {
                    _id: film._id
                },
                film,
                {
                    new: true,
                    upsert: true
                },
                (err, film) => {
                    console.log("film updated.", film);
                    (err) ? reject(err) : resolve();
                }
            );
        });
    }
}

let i: FilmRepository = interpreter;
export default i;