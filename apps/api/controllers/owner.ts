import * as OwnerModel from "../../common/models/owner";

/**
 * 所有者作成
 */
export function create(group: string) {
    interface owner {
        _id: string,
        group: string,
    }
    return new Promise((resolve: (result: owner) => void, reject: (err: Error) => void) => {
        // group文字列のバリデーション
        if (!OwnerModel.isAvailableGroup(group)) return reject(new Error("invalid group name."));

        OwnerModel.default.create({
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

/**
 * 所有者更新
 */
export function findByIdAndUpdate(args: {
    _id: string,
    name?: {
        ja: string,
        en: string
    },
    email?: string,
    tel?: string,
}) {
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
        OwnerModel.default.findOneAndUpdate({
            _id: args._id
        }, {
            $set: args
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
