import * as FilmFactory from "../../factory/film";
import * as PerformanceFactory from "../../factory/performance";
import * as ScreenFactory from "../../factory/screen";
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
            return new Promise<void>((resolveAll: () => void, rejectAll: (err: Error) => void) => {
                COA.findFilmsByTheaterCodeInterface.call({
                    theater_code: theaterCode
                }, (err, films) => {
                    if (err) return rejectAll(err);

                    // あれば更新、なければ追加
                    let promises = films.map((filmByCOA) => {
                        return new Promise((resolve, reject) => {
                            // TODO validation移動
                            if (!filmByCOA.title_code) return resolve();
                            if (!filmByCOA.title_branch_num) return resolve();

                            let film = FilmFactory.createByCOA(theaterCode, filmByCOA);
                            repository.store(film).then(() => {
                                resolve();
                            }, (err) => {
                                reject(err);
                            });
                        });
                    });

                    Promise.all(promises).then(() => {
                        resolveAll();
                    }, (err) => {
                        rejectAll(err);
                    });
                });
            });
        };
    }

    export function importScreens(theaterCode: string) {
        return (repository: ScreenRepository) => {
            return new Promise<void>((resolveAll: () => void, rejectAll: (err: Error) => void) => {
                COA.findScreensByTheaterCodeInterface.call({
                    theater_code: theaterCode
                }, (err, screens) => {
                    if (err) return rejectAll(err);

                    // あれば更新、なければ追加
                    let promises = screens.map((screenByCOA) => {
                        return new Promise((resolve, reject) => {
                            if (!screenByCOA.screen_code) return resolve();

                            let screen = ScreenFactory.createByCOA(theaterCode, screenByCOA);
                            repository.store(screen).then(() => {
                                resolve();
                            }, (err) => {
                                reject(err);
                            });
                        });
                    });

                    Promise.all(promises).then(() => {
                        resolveAll();
                    }, (err) => {
                        rejectAll(err);
                    });
                });
            });
        };
    }
    export function importPerformances(theaterCode: string, dayStart: string, dayEnd: string) {
        return (theaterRepository: TheaterRepository, screenRepository: ScreenRepository, performanceRepository: PerformanceRepository) => {
            return new Promise<void>((resolveAll: () => void, rejectAll: (err: Error) => void) => {
                COA.findPerformancesByTheaterCodeInterface.call({
                    theater_code: theaterCode,
                    begin: dayStart,
                    end: dayEnd,
                }, (err, performances) => {
                    if (err) return rejectAll(err);

                    theaterRepository.findById(theaterCode).then((theater) => {
                        screenRepository.findByTheater(theaterCode).then((screens) => {
                            // あれば更新、なければ追加
                            let promises = performances.map((performanceByCOA) => {
                                return new Promise((resolve, reject) => {
                                    // TODO validation
                                    // if (!performanceByCOA.title_code) return resolve();
                                    // if (!performanceByCOA.title_branch_num) return resolve();
                                    // if (!performanceByCOA.screen_code) return resolve();

                                    let _screen = screens.find((screen) => {
                                        return (screen._id === `${theaterCode}${performanceByCOA.screen_code}`);
                                    });
                                    if (!_screen) return reject("no screen.");

                                    let performance = PerformanceFactory.createByCOA(performanceByCOA, _screen, theater);
                                    performanceRepository.store(performance).then(() => {
                                        resolve();
                                    }, (err) => {
                                        reject(err);
                                    });
                                });
                            });

                            Promise.all(promises).then(() => {
                                resolveAll();
                            }, (err) => {
                                rejectAll(err);
                            });
                        });
                    });
                });
            });
        };
    }
}

let i: MasterService = interpreter;
export default i;