import {film as theaterModel} from "../../common/models";

/**
 * 作品詳細
 */
export function findById(id: string) {
    interface film {
        _id: string,
        name: {
            ja: string,
            en: string
        }
        name_kana: string
    }

    return new Promise((resolve: (result: film) => void, reject: (err: Error) => void) => {
        theaterModel.findOne({
            _id: id
        }, (err, film) => {
            if (err) return reject(err);
            if (!film) return reject(new Error("Not Found."));

            resolve({
                _id: film.get("_id"),
                name: film.get("name"),
                name_kana: film.get("name_kana")
            });
        })
    });

}
