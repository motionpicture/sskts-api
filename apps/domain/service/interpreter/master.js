"use strict";
const FilmFactory = require("../../factory/film");
const PerformanceFactory = require("../../factory/performance");
const ScreenFactory = require("../../factory/screen");
const TheaterFactory = require("../../factory/theater");
const COA = require("@motionpicture/coa-service");
var interpreter;
(function (interpreter) {
    function importTheater(code) {
        return (repository) => {
            return new Promise((resolve, reject) => {
                COA.findTheaterInterface.call({
                    theater_code: code
                }, (err, theaterByCOA) => {
                    if (err)
                        return reject(err);
                    if (!theaterByCOA)
                        return reject(new Error("theater not found."));
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
    interpreter.importTheater = importTheater;
    function importFilms(theaterCode) {
        return (repository) => {
            return new Promise((resolveAll, rejectAll) => {
                COA.findFilmsByTheaterCodeInterface.call({
                    theater_code: theaterCode
                }, (err, films) => {
                    if (err)
                        return rejectAll(err);
                    let promises = films.map((filmByCOA) => {
                        return new Promise((resolve, reject) => {
                            if (!filmByCOA.title_code)
                                return resolve();
                            if (!filmByCOA.title_branch_num)
                                return resolve();
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
    interpreter.importFilms = importFilms;
    function importScreens(theaterCode) {
        return (repository) => {
            return new Promise((resolveAll, rejectAll) => {
                COA.findScreensByTheaterCodeInterface.call({
                    theater_code: theaterCode
                }, (err, screens) => {
                    if (err)
                        return rejectAll(err);
                    let promises = screens.map((screenByCOA) => {
                        return new Promise((resolve, reject) => {
                            if (!screenByCOA.screen_code)
                                return resolve();
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
    interpreter.importScreens = importScreens;
    function importPerformances(theaterCode, dayStart, dayEnd) {
        return (theaterRepository, screenRepository, performanceRepository) => {
            return new Promise((resolveAll, rejectAll) => {
                COA.findPerformancesByTheaterCodeInterface.call({
                    theater_code: theaterCode,
                    begin: dayStart,
                    end: dayEnd,
                }, (err, performances) => {
                    if (err)
                        return rejectAll(err);
                    theaterRepository.findById(theaterCode).then((theater) => {
                        screenRepository.findByTheater(theaterCode).then((screens) => {
                            let promises = performances.map((performanceByCOA) => {
                                return new Promise((resolve, reject) => {
                                    let screenCode = `${theaterCode}${performanceByCOA.screen_code}`;
                                    let _screen = screens.find((screen) => {
                                        return (screen._id === screenCode);
                                    });
                                    if (!_screen)
                                        return reject("no screen.");
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
    interpreter.importPerformances = importPerformances;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
