"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const FilmFactory = require("../../factory/film");
const PerformanceFactory = require("../../factory/performance");
const ScreenFactory = require("../../factory/screen");
const TheaterFactory = require("../../factory/theater");
const COA = require("@motionpicture/coa-service");
var interpreter;
(function (interpreter) {
    function importTheater(code) {
        return (repository) => __awaiter(this, void 0, void 0, function* () {
            let theaterByCOA = yield COA.findTheaterInterface.call({
                theater_code: code
            });
            if (!theaterByCOA)
                throw new Error("theater not found.");
            let theater = TheaterFactory.createByCOA(theaterByCOA);
            yield repository.store(theater);
        });
    }
    interpreter.importTheater = importTheater;
    function importFilms(theaterCode) {
        return (repository) => __awaiter(this, void 0, void 0, function* () {
            let films = yield COA.findFilmsByTheaterCodeInterface.call({
                theater_code: theaterCode
            });
            let promises = films.map((filmByCOA) => __awaiter(this, void 0, void 0, function* () {
                let film = FilmFactory.createByCOA(theaterCode, filmByCOA);
                yield repository.store(film);
            }));
            yield Promise.all(promises);
        });
    }
    interpreter.importFilms = importFilms;
    function importScreens(theaterCode) {
        return (repository) => __awaiter(this, void 0, void 0, function* () {
            let screens = yield COA.findScreensByTheaterCodeInterface.call({
                theater_code: theaterCode
            });
            let promises = screens.map((screenByCOA) => __awaiter(this, void 0, void 0, function* () {
                let screen = ScreenFactory.createByCOA(theaterCode, screenByCOA);
                yield repository.store(screen);
            }));
            yield Promise.all(promises);
        });
    }
    interpreter.importScreens = importScreens;
    function importPerformances(theaterId, dayStart, dayEnd) {
        return (filmRepository, theaterRepository, screenRepository, performanceRepository) => __awaiter(this, void 0, void 0, function* () {
            let performances = yield COA.findPerformancesByTheaterCodeInterface.call({
                theater_code: theaterId,
                begin: dayStart,
                end: dayEnd,
            });
            let optionTheater = yield theaterRepository.findById(theaterId);
            if (optionTheater.isEmpty)
                throw new Error("theater not found.");
            let theater = optionTheater.get();
            let screens = yield screenRepository.findByTheater(theaterId);
            let promises = performances.map((performanceByCOA) => __awaiter(this, void 0, void 0, function* () {
                let screenId = `${theaterId}${performanceByCOA.screen_code}`;
                let filmId = `${theater._id}${performanceByCOA.title_code}${performanceByCOA.title_branch_num}`;
                let _screen = screens.find((screen) => { return (screen._id === screenId); });
                if (!_screen)
                    throw new Error(("screen not found."));
                let optionFilm = yield filmRepository.findById(filmId);
                if (optionFilm.isEmpty)
                    throw new Error("film not found.");
                let film = optionFilm.get();
                let performance = PerformanceFactory.createByCOA(performanceByCOA, _screen, theater, film);
                yield performanceRepository.store(performance);
            }));
            yield Promise.all(promises);
        });
    }
    interpreter.importPerformances = importPerformances;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
