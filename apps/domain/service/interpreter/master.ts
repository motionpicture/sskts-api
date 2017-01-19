import MasterService from "../master";
import TheaterRepository from "../../repository/theater";
import FilmRepository from "../../repository/film";
import ScreenRepository from "../../repository/screen";
import PerformanceRepository from "../../repository/performance";
import COA = require("@motionpicture/coa-service");

namespace interpreter {
    export function importTheater(args: {
        theater_code: string
    }) {
        return async (repository: TheaterRepository) => {
            await COA.findTheaterInterface.call({
                theater_code: args.theater_code
            }).then(repository.storeFromCOA);
        };
    }

    export function importFilms(args: {
        theater_code: string
    }) {
        return async (theaterRepository: TheaterRepository, filmRepository: FilmRepository) => {
            let optionTheater = await theaterRepository.findById(args.theater_code);
            if (optionTheater.isEmpty) throw new Error("theater not found.");

            let films = await COA.findFilmsByTheaterCodeInterface.call({
                theater_code: args.theater_code
            });

            await Promise.all(films.map(async (filmByCOA) => {
                await filmRepository.storeFromCOA(filmByCOA)(optionTheater.get());
            }));
        };
    }

    export function importScreens(args: {
        theater_code: string
    }) {
        return async (theaterRepository: TheaterRepository, screenRepository: ScreenRepository) => {
            let optionTheater = await theaterRepository.findById(args.theater_code);
            if (optionTheater.isEmpty) throw new Error("theater not found.");

            let screens = await COA.findScreensByTheaterCodeInterface.call({
                theater_code: args.theater_code
            });

            await Promise.all(screens.map(async (screenByCOA) => {
                await screenRepository.storeFromCOA(screenByCOA)(optionTheater.get());
            }));
        };
    }

    export function importPerformances(args: {
        theater_code: string,
        day_start: string,
        day_end: string
    }) {
        return async (filmRepository: FilmRepository, screenRepository: ScreenRepository, performanceRepository: PerformanceRepository) => {
            let screens = await screenRepository.findByTheater(args.theater_code);

            let performances = await COA.findPerformancesByTheaterCodeInterface.call({
                theater_code: args.theater_code,
                begin: args.day_start,
                end: args.day_end,
            });

            await Promise.all(performances.map(async (performanceByCOA) => {
                let screenId = `${args.theater_code}${performanceByCOA.screen_code}`;
                let filmId = `${args.theater_code}${performanceByCOA.title_code}${performanceByCOA.title_branch_num}`;

                let _screen = screens.find((screen) => { return (screen._id === screenId); });
                if (!_screen) throw new Error(("screen not found."));

                let optionFilm = await filmRepository.findById(filmId);
                if (optionFilm.isEmpty) throw new Error("film not found.");

                await performanceRepository.storeFromCOA(performanceByCOA)(_screen, optionFilm.get());
            }));
        };
    }
}

let i: MasterService = interpreter;
export default i;