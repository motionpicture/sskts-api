import mongoose = require("mongoose");
import * as OwnerFactory from "../../factory/owner";
import OwnerService from "../owner";
import OwnerRepository from "../../repository/owner";

namespace interpreter {
    export function createAnonymous() {
        return async (repository: OwnerRepository) => {
            // 新しい一般所有者を作成
            let owner = OwnerFactory.createAnonymous({
                _id: mongoose.Types.ObjectId().toString()
            });

            // 永続化
            await repository.store(owner);

            return owner;
        };
    }

    export function updateAnonymous(args: {
        _id: string,
        name_first?: string,
        name_last?: string,
        email?: string,
        tel?: string,
    }) {
        return async (repository: OwnerRepository) => {
            // 永続化
            let option = await repository.findOneAndUpdate({
                _id: args._id,
            }, { $set: args });
            if (option.isEmpty) throw new Error("owner not found.");
        };
    }
}

let i: OwnerService = interpreter;
export default i;