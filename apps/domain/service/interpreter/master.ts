import MasterService from "../master";
import TheaterRepository from "../../repository/theater";
import FilmRepository from "../../repository/film";
import ScreenRepository from "../../repository/screen";
import PerformanceRepository from "../../repository/performance";
import COA = require("@motionpicture/coa-service");

namespace interpreter {
    export function importTheater(code: string) {
        return async (repository: TheaterRepository) => {
            await COA.findTheaterInterface.call({
                theater_code: code
            }).then(repository.storeFromCOA);
        };
    }

    export function importFilms(theaterCode: string) {
        return async (theaterRepository: TheaterRepository, filmRepository: FilmRepository) => {
            let optionTheater = await theaterRepository.findById(theaterCode);
            if (optionTheater.isEmpty) throw new Error("theater not found.");

            let films = await COA.findFilmsByTheaterCodeInterface.call({
                theater_code: theaterCode
            });

            await Promise.all(films.map(async (filmByCOA) => {
                await filmRepository.storeFromCOA(filmByCOA)(optionTheater.get());
            }));
        };
    }

    export function importScreens(theaterCode: string) {
        return async (theaterRepository: TheaterRepository, screenRepository: ScreenRepository) => {
            let optionTheater = await theaterRepository.findById(theaterCode);
            if (optionTheater.isEmpty) throw new Error("theater not found.");

            let screens = await COA.findScreensByTheaterCodeInterface.call({
                theater_code: theaterCode
            });

            await Promise.all(screens.map(async (screenByCOA) => {
                await screenRepository.storeFromCOA(screenByCOA)(optionTheater.get());
            }));
        };
    }

    export function importPerformances(theaterId: string, dayStart: string, dayEnd: string) {
        return async (filmRepository: FilmRepository, screenRepository: ScreenRepository, performanceRepository: PerformanceRepository) => {
            let screens = await screenRepository.findByTheater(theaterId);

            let performances = await COA.findPerformancesByTheaterCodeInterface.call({
                theater_code: theaterId,
                begin: dayStart,
                end: dayEnd,
            });

            await Promise.all(performances.map(async (performanceByCOA) => {
                let screenId = `${theaterId}${performanceByCOA.screen_code}`;
                let filmId = `${theaterId}${performanceByCOA.title_code}${performanceByCOA.title_branch_num}`;

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