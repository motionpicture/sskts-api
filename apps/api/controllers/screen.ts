import {screen as screenModel} from "../../common/models";

/**
 * スクリーン詳細
 */
export function findById(id: string) {
    interface screen {
        _id: string,
        theater: string,
        name: {
            ja: string,
            en: string
        },
        seats_number: number,
        sections: [
            {
                code: string,
                name: {
                    ja: string,
                    en: string,
                },
                seats: [
                    {
                        code: string,
                    }
                ]
            }
        ]
    }

    return new Promise((resolve: (result: screen) => void, reject: (err: Error) => void) => {
        screenModel.findOne({
            _id: id
        })
        .exec((err, screen) => {
            if (err) return reject(err);
            if (!screen) return reject(new Error("Not Found."));

            resolve({
                _id: screen.get("_id"),
                theater: screen.get("theater"),
                name: screen.get("name"),
                seats_number: screen.get("seats_number"),
                sections: screen.get("sections")
            });
        })
    });
}
