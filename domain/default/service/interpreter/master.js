"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const COA = require("@motionpicture/coa-service");
const TheaterFactory = require("../../factory/theater");
const FilmFactory = require("../../factory/film");
const ScreenFactory = require("../../factory/screen");
const PerformanceFactory = require("../../factory/performance");
var interpreter;
(function (interpreter) {
    function importTheater(args) {
        return (repository) => __awaiter(this, void 0, void 0, function* () {
            let theaterFromCOA = yield COA.findTheaterInterface.call({
                theater_code: args.theater_code
            });
            let theater = TheaterFactory.createFromCOA(theaterFromCOA);
            yield repository.store(theater);
        });
    }
    interpreter.importTheater = importTheater;
    function importFilms(args) {
        return (theaterRepository, filmRepository) => __awaiter(this, void 0, void 0, function* () {
            let optionTheater = yield theaterRepository.findById(args.theater_code);
            if (optionTheater.isEmpty)
                throw new Error("theater not found.");
            let films = yield COA.findFilmsByTheaterCodeInterface.call({
                theater_code: args.theater_code
            });
            yield Promise.all(films.map((filmFromCOA) => __awaiter(this, void 0, void 0, function* () {
                let film = yield FilmFactory.createFromCOA(filmFromCOA)(optionTheater.get());
                yield filmRepository.store(film);
            })));
        });
    }
    interpreter.importFilms = importFilms;
    function importScreens(args) {
        return (theaterRepository, screenRepository) => __awaiter(this, void 0, void 0, function* () {
            let optionTheater = yield theaterRepository.findById(args.theater_code);
            if (optionTheater.isEmpty)
                throw new Error("theater not found.");
            let screens = yield COA.findScreensByTheaterCodeInterface.call({
                theater_code: args.theater_code
            });
            yield Promise.all(screens.map((screenFromCOA) => __awaiter(this, void 0, void 0, function* () {
                let screen = yield ScreenFactory.createFromCOA(screenFromCOA)(optionTheater.get());
                yield screenRepository.store(screen);
            })));
        });
    }
    interpreter.importScreens = importScreens;
    function importPerformances(args) {
        return (filmRepository, screenRepository, performanceRepository) => __awaiter(this, void 0, void 0, function* () {
            let screens = yield screenRepository.findByTheater(args.theater_code);
            let performances = yield COA.findPerformancesByTheaterCodeInterface.call({
                theater_code: args.theater_code,
                begin: args.day_start,
                end: args.day_end,
            });
            yield Promise.all(performances.map((performanceFromCOA) => __awaiter(this, void 0, void 0, function* () {
                let screenId = `${args.theater_code}${performanceFromCOA.screen_code}`;
                let filmId = `${args.theater_code}${performanceFromCOA.title_code}${performanceFromCOA.title_branch_num}`;
                let _screen = screens.find((screen) => { return (screen._id === screenId); });
                if (!_screen)
                    throw new Error(("screen not found."));
                let optionFilm = yield filmRepository.findById(filmId);
                if (optionFilm.isEmpty)
                    throw new Error("film not found.");
                let performance = PerformanceFactory.createFromCOA(performanceFromCOA)(_screen, optionFilm.get());
                yield performanceRepository.store(performance);
            })));
        });
    }
    interpreter.importPerformances = importPerformances;
    function searchPerformances(conditions) {
        return (performanceRepository) => __awaiter(this, void 0, void 0, function* () {
            let andConditions = [
                { _id: { $ne: null } }
            ];
            if (conditions.day) {
                andConditions.push({ day: conditions.day });
            }
            if (conditions.theater) {
                andConditions.push({ theater: conditions.theater });
            }
            let performances = yield performanceRepository.find({ $and: andConditions });
            return performances.map((performance) => {
                return {
                    _id: performance._id,
                    theater: {
                        _id: performance.theater._id,
                        name: performance.theater.name,
                    },
                    screen: {
                        _id: performance.screen._id,
                        name: performance.screen.name,
                    },
                    film: {
                        _id: performance.film._id,
                        name: performance.film.name,
                    },
                    day: performance.day,
                    time_start: performance.time_start,
                    time_end: performance.time_end,
                    canceled: performance.canceled,
                };
            });
        });
    }
    interpreter.searchPerformances = searchPerformances;
    function findTheater(args) {
        return (repository) => __awaiter(this, void 0, void 0, function* () {
            return yield repository.findById(args.theater_id);
        });
    }
    interpreter.findTheater = findTheater;
    function findFilm(args) {
        return (repository) => __awaiter(this, void 0, void 0, function* () {
            return yield repository.findById(args.film_id);
        });
    }
    interpreter.findFilm = findFilm;
    function findScreen(args) {
        return (repository) => __awaiter(this, void 0, void 0, function* () {
            return yield repository.findById(args.screen_id);
        });
    }
    interpreter.findScreen = findScreen;
    function findPerformance(args) {
        return (repository) => __awaiter(this, void 0, void 0, function* () {
            return yield repository.findById(args.performance_id);
        });
    }
    interpreter.findPerformance = findPerformance;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
