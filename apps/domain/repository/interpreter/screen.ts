import mongoose = require("mongoose");
import monapt = require("monapt");
import Screen from "../../model/screen";
import Theater from "../../model/theater";
import ScreenRepository from "../screen";
import ScreenModel from "./mongoose/model/screen";
import COA = require("@motionpicture/coa-service");

namespace interpreter {
    export function createFromDocument(doc: mongoose.Document): Screen {
        return new Screen(
            doc.get("_id"),
            doc.get("theater"),
            doc.get("coa_screen_code"),
            doc.get("name"),
            doc.get("sections")
        );
    }

    export async function findById(id: string) {
        let screen = await ScreenModel.findOne({ _id: id }).exec();
        if (!screen) return monapt.None;

        return monapt.Option(createFromDocument(screen));
    }

    export async function findByTheater(theaterCode: string) {
        let screens = await ScreenModel.find({theater: theaterCode}).exec();
        return screens.map((screen) => {
            return createFromDocument(screen);
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

            await store(new Screen(
                `${theater._id}${screenByCOA.screen_code}`,
                theater,
                screenByCOA.screen_code,
                {
                    ja: screenByCOA.screen_name,
                    en: screenByCOA.screen_name_eng
                },
                sections
            ));
        }
    }
}

let i: ScreenRepository = interpreter;
export default i;