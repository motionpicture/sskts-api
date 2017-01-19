import monapt = require("monapt");
import Screen from "../../model/screen";
import Theater from "../../model/theater";
import ScreenRepository from "../screen";
import * as ScreenFactory from "../../factory/screen";
import ScreenModel from "./mongoose/model/screen";
import COA = require("@motionpicture/coa-service");

namespace interpreter {
    export async function findById(id: string) {
        let doc = await ScreenModel.findOne({ _id: id }).exec();
        if (!doc) return monapt.None;

        let screen = ScreenFactory.create({
            _id: doc.get("_id"),
            theater: doc.get("theater"),
            coa_screen_code: doc.get("coa_screen_code"),
            name: doc.get("name"),
            sections: doc.get("sections")
        });

        return monapt.Option(screen);
    }

    export async function findByTheater(theaterCode: string) {
        let docs = await ScreenModel.find({theater: theaterCode}).exec();
        return docs.map((doc) => {
            return ScreenFactory.create({
                _id: doc.get("_id"),
                theater: doc.get("theater"),
                coa_screen_code: doc.get("coa_screen_code"),
                name: doc.get("name"),
                sections: doc.get("sections")
            });
        });
    }

    export async function store(screen: Screen) {
        await ScreenModel.findOneAndUpdate({ _id: screen._id }, screen, {
            new: true,
            upsert: true
        }).lean().exec();
    }

    export function storeFromCOA(screenByCOA: COA.findScreensByTheaterCodeInterface.Result) {
        return async (theater: Theater) => {
            let sections: Array<{
                code: string,
                name: {
                    ja: string,
                    en: string,
                },
                seats: Array<{
                    code: string
                }>
            }> = [];
            let sectionCodes: Array<string> = [];
            screenByCOA.list_seat.forEach((seat) => {
                if (sectionCodes.indexOf(seat.seat_section) < 0) {
                    sectionCodes.push(seat.seat_section);
                    sections.push({
                        code: seat.seat_section,
                        name: {
                            ja: `セクション${seat.seat_section}`,
                            en: `section${seat.seat_section}`,
                        },
                        seats: []
                    });
                }

                sections[sectionCodes.indexOf(seat.seat_section)].seats.push({
                    code: seat.seat_num
                });
            });

            let screen = ScreenFactory.create({
                _id: `${theater._id}${screenByCOA.screen_code}`,
                theater: theater,
                coa_screen_code: screenByCOA.screen_code,
                name: {
                    ja: screenByCOA.screen_name,
                    en: screenByCOA.screen_name_eng
                },
                sections: sections
            });

            await store(screen);
        }
    }
}

let i: ScreenRepository = interpreter;
export default i;