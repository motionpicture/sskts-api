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
        return async (repository: TheaterRepository) => {
            let theaterByCOA = await COA.findTheaterInterface.call({
                theater_code: code
            });
            if (!theaterByCOA) throw new Error("theater not found.");

            let theater = TheaterFactory.createByCOA(theaterByCOA);
            await repository.store(theater);
        };
    }

    export function importFilms(theaterCode: string) {
        return async (repository: FilmRepository) => {
            let films = await COA.findFilmsByTheaterCodeInterface.call({
                theater_code: theaterCode
            });

            let promises = films.map(async (filmByCOA) => {
                let film = FilmFactory.createByCOA(theaterCode, filmByCOA);
                await repository.store(film);
            });

            await Promise.all(promises);
        };
    }

    export function importScreens(theaterCode: string) {
        return async (repository: ScreenRepository) => {
            let screens = await COA.findScreensByTheaterCodeInterface.call({
                theater_code: theaterCode
            });

            let promises = screens.map(async (screenByCOA) => {
                let screen = ScreenFactory.createByCOA(theaterCode, screenByCOA);
                await repository.store(screen);
            });

            await Promise.all(promises);
        };
    }

    export function importPerformances(theaterId: string, dayStart: string, dayEnd: string) {
        return async (filmRepository: FilmRepository, theaterRepository: TheaterRepository, screenRepository: ScreenRepository, performanceRepository: PerformanceRepository) => {
            let performances = await COA.findPerformancesByTheaterCodeInterface.call({
                theater_code: theaterId,
                begin: dayStart,
                end: dayEnd,
            });

            let optionTheater = await theaterRepository.findById(theaterId);
            if (optionTheater.isEmpty) throw new Error("theater not found.");
            let theater = optionTheater.get();

            let screens = await screenRepository.findByTheater(theaterId);

            let promises = performances.map(async (performanceByCOA) => {
                let screenId = `${theaterId}${performanceByCOA.screen_code}`;
                let filmId = `${theater._id}${performanceByCOA.title_code}${performanceByCOA.title_branch_num}`;

                let _screen = screens.find((screen) => { return (screen._id === screenId); });
                if (!_screen) throw new Error(("screen not found."));

                let optionFilm = await filmRepository.findById(filmId);
                if (optionFilm.isEmpty) throw new Error("film not found.");
                let film = optionFilm.get();

                let performance = PerformanceFactory.createByCOA(performanceByCOA, _screen, theater, film);
                await performanceRepository.store(performance);
            });

            await Promise.all(promises);
        };
    }
}

let i: MasterService = interpreter;
export default i;