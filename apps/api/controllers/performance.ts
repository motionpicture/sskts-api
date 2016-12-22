import {performance as performanceModel} from "../../common/models";

/**
 * パフォーマンス詳細
 */
export function findById(id: string) {
    interface performance {
        _id: string,
        screen: string,
        screen_name: {
            ja: string,
            en: string
        },
        theater: string,
        theater_name: {
            ja: string,
            en: string
        },
        film: string,
        film_name: {
            ja: string,
            en: string
        },
        day: string,
        time_start: string,
        time_end: string
    }

    return new Promise((resolve: (result: performance) => void, reject: (err: Error) => void) => {
        performanceModel.findOne({
            _id: id
        })
        .populate('film', 'name minutes copyright')
        .exec((err, performance) => {
            if (err) return reject(err);
            if (!performance) return reject(new Error("Not Found."));

            resolve({
                _id: performance.get("_id"),
                screen: performance.get("screen"),
                screen_name: performance.get("screen_name"),
                theater: performance.get("theater"),
                theater_name: performance.get("theater_name"),
                film: performance.get("film").get("_id"),
                film_name: performance.get("film").get("name"),
                day: performance.get("day"),
                time_start: performance.get("time_start"),
                time_end: performance.get("time_end")
            });
        })
    });
}

/**
 * パフォーマンス検索
 */
interface conditions {
    day?: string,
    theater?: string
}
export function find(conditions: conditions) {
    interface performance {
        _id: string,
        screen: string,
        screen_name: {
            ja: string,
            en: string
        },
        theater: string,
        theater_name: {
            ja: string,
            en: string
        },
        film: string,
        film_name: {
            ja: string,
            en: string
        },
        day: string,
        time_start: string,
        time_end: string
    }


    // 検索条件を作成
    let andConditions: Array<Object> = [
    ];

    if (conditions.day) {
        andConditions.push({
            day: conditions.day
        });
    }

    if (conditions.theater) {
        andConditions.push({
            theater: conditions.theater
        });
    }

    return new Promise((resolve: (result: Array<performance>) => void, reject: (err: Error) => void) => {
        performanceModel.find({$and: andConditions})
        .populate('film', 'name minutes copyright')
        .lean(true)
        .exec((err, performances: Array<performance>) => {
            if (err) return reject(err);

            resolve(performances);
        })
    });
}