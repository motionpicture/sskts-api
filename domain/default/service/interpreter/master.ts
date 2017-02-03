import MasterService from "../master";
import TheaterRepository from "../../repository/theater";
import FilmRepository from "../../repository/film";
import ScreenRepository from "../../repository/screen";
import PerformanceRepository from "../../repository/performance";
import COA = require("@motionpicture/coa-service");
import MultilingualString from "../../model/multilingualString";
import * as TheaterFactory from "../../factory/theater";
import * as FilmFactory from "../../factory/film";
import * as ScreenFactory from "../../factory/screen";
import * as PerformanceFactory from "../../factory/performance";

interface SearchPerformancesConditions {
    day?: string,
    theater?: string
}
interface SearchPerformancesResult {
    _id: string,
    theater: {
        _id: string,
        name: MultilingualString
    },
    screen: {
        _id: string,
        name: MultilingualString
    },
    film: {
        _id: string,
        name: MultilingualString
    },
    day: string,
    time_start: string,
    time_end: string,
    canceled: boolean
}

class MasterServiceInterpreter implements MasterService {
    /**
     * 劇場インポート
     */
    importTheater(args: {
        theater_code: string
    }) {
        return async (repository: TheaterRepository) => {
            // COAから取得
            let theaterFromCOA = await COA.findTheaterInterface.call({
                theater_code: args.theater_code
            });

            // 永続化
            let theater = TheaterFactory.createFromCOA(theaterFromCOA);
            await repository.store(theater);
        };
    }

    /**
     * 作品インポート
     */
    importFilms(args: {
        theater_code: string
    }) {
        return async (theaterRepository: TheaterRepository, filmRepository: FilmRepository) => {
            // 劇場取得
            let optionTheater = await theaterRepository.findById(args.theater_code);
            if (optionTheater.isEmpty) throw new Error("theater not found.");

            // COAから作品取得
            let films = await COA.findFilmsByTheaterCodeInterface.call({
                theater_code: args.theater_code
            });

            // 永続化
            await Promise.all(films.map(async (filmFromCOA) => {
                let film = await FilmFactory.createFromCOA(filmFromCOA)(optionTheater.get());
                await filmRepository.store(film);
            }));
        };
    }

    importScreens(args: {
        theater_code: string
    }) {
        return async (theaterRepository: TheaterRepository, screenRepository: ScreenRepository) => {
            // 劇場取得
            let optionTheater = await theaterRepository.findById(args.theater_code);
            if (optionTheater.isEmpty) throw new Error("theater not found.");

            // COAからスクリーン取得
            let screens = await COA.findScreensByTheaterCodeInterface.call({
                theater_code: args.theater_code
            });

            // 永続化
            await Promise.all(screens.map(async (screenFromCOA) => {
                let screen = await ScreenFactory.createFromCOA(screenFromCOA)(optionTheater.get());
                await screenRepository.store(screen);
            }));
        };
    }

    importPerformances(args: {
        theater_code: string,
        day_start: string,
        day_end: string
    }) {
        return async (filmRepository: FilmRepository, screenRepository: ScreenRepository, performanceRepository: PerformanceRepository) => {
            // スクリーン取得
            let screens = await screenRepository.findByTheater({ theater_id: args.theater_code });

            // COAからパフォーマンス取得
            let performances = await COA.findPerformancesByTheaterCodeInterface.call({
                theater_code: args.theater_code,
                begin: args.day_start,
                end: args.day_end,
            });

            // パフォーマンスごとに永続化トライ
            await Promise.all(performances.map(async (performanceFromCOA) => {
                let screenId = `${args.theater_code}${performanceFromCOA.screen_code}`;
                let filmId = `${args.theater_code}${performanceFromCOA.title_code}${performanceFromCOA.title_branch_num}`;

                // スクリーン存在チェック
                let _screen = screens.find((screen) => { return (screen._id === screenId); });
                if (!_screen) throw new Error(("screen not found."));

                // 作品取得
                let optionFilm = await filmRepository.findById(filmId);
                if (optionFilm.isEmpty) throw new Error("film not found.");

                // 永続化
                let performance = PerformanceFactory.createFromCOA(performanceFromCOA)(_screen, optionFilm.get());
                await performanceRepository.store(performance);
            }));
        };
    }

    /**
     * パフォーマンス検索
     */
    searchPerformances(conditions: SearchPerformancesConditions) {
        return async (performanceRepository: PerformanceRepository): Promise<Array<SearchPerformancesResult>> => {
            // 検索条件を作成
            let andConditions: Array<Object> = [
                { _id: { $ne: null } }
            ];

            if (conditions.day) {
                andConditions.push({ day: conditions.day });
            }

            if (conditions.theater) {
                andConditions.push({ theater: conditions.theater });
            }

            let performances = await performanceRepository.find({ $and: andConditions });

            // TODO 空席状況を追加

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
                }
            });
        }
    }

    /**
     * 劇場取得
     */
    findTheater(args: {
        theater_id: string
    }) {
        return async (repository: TheaterRepository) => {
            return await repository.findById(args.theater_id);
        }
    }

    /**
     * 作品取得
     */
    findFilm(args: {
        film_id: string
    }) {
        return async (repository: FilmRepository) => {
            return await repository.findById(args.film_id);
        }
    }

    /**
     * スクリーン取得
     */
    findScreen(args: {
        screen_id: string
    }) {
        return async (repository: ScreenRepository) => {
            return await repository.findById(args.screen_id);
        }
    }

    /**
     * パフォーマンス取得
     */
    findPerformance(args: {
        performance_id: string
    }) {
        return async (repository: PerformanceRepository) => {
            return await repository.findById(args.performance_id);
        }
    }
}

export default new MasterServiceInterpreter();