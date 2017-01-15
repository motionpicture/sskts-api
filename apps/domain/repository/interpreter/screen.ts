import Screen from "../../model/Screen";
import ScreenRepository from "../screen";
import * as ScreenModel from "../../../common/models/screen";

namespace interpreter {
    export function find(id: string) {
        return new Promise<Screen>((resolve, reject) => {
            reject(new Error("now coding..."));
        });
    }

    export function findByTheater(theaterCode: string) {
        return new Promise<Array<Screen>>((resolve, reject) => {
            ScreenModel.default.find({
                theater: theaterCode
            }).lean().exec().then((screens: Array<Screen>) => {
                resolve(screens);
            }, (err) => {
                reject(err);
            });
        });
    }

    export function store(screen: Screen) {
        return new Promise<void>((resolve, reject) => {
            // あれば更新、なければ追加
            console.log("updating screen...");
            ScreenModel.default.findOneAndUpdate({ _id: screen._id }, screen, {
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

let i: ScreenRepository = interpreter;
export default i;