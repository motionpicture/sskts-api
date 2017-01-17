import mongoose = require("mongoose");
import * as OwnerFactory from "../../factory/owner";
import OwnerService from "../owner";
import AnonymousOwnerRepository from "../../repository/owner/anonymous";

namespace interpreter {
    export function createAnonymous() {
        return async (repository: AnonymousOwnerRepository) => {
            // 新しい一般所有者を作成
            let owner = OwnerFactory.createAnonymous({
                _id: mongoose.Types.ObjectId().toString()
            });

            // 永続化
            await repository.store(owner);

            return owner;
        };
    }
}

let i: OwnerService = interpreter;
export default i;