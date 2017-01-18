import MultilingualString from "../../model/multilingualString";
import PerformanceService from "../performance";
import PerformanceRepository from "../../repository/performance";
interface SearchConditions {
    day?: string,
    theater?: string
}

interface SearchResult {
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

namespace interpreter {
    export function search(conditions: SearchConditions) {
        return async (performanceRepository: PerformanceRepository): Promise<Array<SearchResult>> => {
            // 検索条件を作成
            let andConditions: Array<Object> = [
                {_id: {$ne: null}}
            ];

            if (conditions.day) {
                andConditions.push({day: conditions.day});
            }

            if (conditions.theater) {
                andConditions.push({theater: conditions.theater});
            }

            let performances = await performanceRepository.find({$and: andConditions});

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
}

let i: PerformanceService = interpreter;
export default i;