import {owner as ownerModel} from "../../common/models";

/**
 * 所有者作成
 */
export function create(group: string) {
    // TODO group文字列のバリデーション

    interface owner {
        _id: string,
        group: string,
    }
    return new Promise((resolve: (result: owner) => void, reject: (err: Error) => void) => {
        ownerModel.create({
            group: group,
        }).then((owner) => {
            resolve({
                _id: owner.get("_id"),
                group: owner.get("group")
            });
        }, (err) => {
            reject(err);
        });
    });
}
