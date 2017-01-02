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

interface Update {
    name?: {
        ja: string,
        en: string
    },
    email?: string,
    tel?: string,
}
/**
 * 所有者更新
 */
export function findByIdAndUpdate(id: string, update: Update) {
    interface owner {
        _id: string,
        group: string,
        name: {
            ja: string,
            en: string
        },
        email: string,
        tel: string,
    }
    return new Promise((resolve: (result: owner) => void, reject: (err: Error) => void) => {
        ownerModel.findOneAndUpdate({
            _id: id
        }, {
            $set: update
        }, {
            new: true,
            upsert: false
        }, ((err, owner) => {
            if (err) return reject(err);
            if (!owner) return reject(new Error("owner not found."));

            resolve({
                _id: owner.get("_id"),
                group: owner.get("group"),
                name: owner.get("name"),
                email: owner.get("email"),
                tel: owner.get("tel"),
            });
        }));
    });
}
