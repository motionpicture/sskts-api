import Screen from "../../model/Screen";
import ScreenRepository from "../screen";
import ScreenModel from "./mongoose/model/screen";

namespace interpreter {
    export function findById(id: string) {
        return new Promise<Screen>((resolve, reject) => {
            ScreenModel.findOne({ _id: id }).lean().exec().then((screen: Screen) => {
                resolve(screen);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    export function findByTheater(theaterCode: string) {
        return new Promise<Array<Screen>>((resolve, reject) => {
            ScreenModel.find({
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
            ScreenModel.findOneAndUpdate({ _id: screen._id }, screen, {
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