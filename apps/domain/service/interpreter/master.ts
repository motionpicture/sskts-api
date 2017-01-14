import * as TheaterFactory from "../../factory/theater";
import MasterService from "../master";
import TheaterRepository from "../../repository/theater";
import FilmRepository from "../../repository/film";
import ScreenRepository from "../../repository/screen";
import PerformanceRepository from "../../repository/performance";
import COA = require("@motionpicture/coa-service");

namespace interpreter {
    export function importTheater(code: string) {
        return (repository: TheaterRepository) => {
            return new Promise<void>((resolve: () => void, reject: (err: Error) => void) => {
                COA.findTheaterInterface.call({
                    theater_code: code
                }, (err, theaterByCOA) => {
                    if (err) return reject(err);
                    if (!theaterByCOA) return reject(new Error("theater not found."));

                    let theater = TheaterFactory.createByCOA(theaterByCOA);
                    repository.store(theater).then(() => {
                        resolve();
                    }, (err) => {
                        reject(err);
                    });
                });
            });
        };
    }

    export function importFilms(theaterCode: string) {
        return (repository: FilmRepository) => {
            return new Promise<void>((resolve: () => void, reject: (err: Error) => void) => {
                reject(new Error("now coding..."));
            });
        };
    }

    export function importScreens(theaterCode: string) {
        return (repository: ScreenRepository) => {
            return new Promise<void>((resolve: () => void, reject: (err: Error) => void) => {
                reject(new Error("now coding..."));
            });
        };
    }
    export function importPerformances(theaterCode: string, dayStart: string, dayEnd: string) {
        return (repository: PerformanceRepository) => {
            return new Promise<void>((resolve: () => void, reject: (err: Error) => void) => {
                reject(new Error("now coding..."));
            });
        };
    }
}

let s: MasterService = interpreter;
export default s;