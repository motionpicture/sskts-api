import mongoose = require("mongoose");

import OwnerService from "../owner";

import OwnerRepository from "../../repository/owner";
import AdministratorOwnerRepository from "../../repository/owner/administrator";

import * as OwnerFactory from "../../factory/owner";

namespace interpreter {
    export function createAnonymous() {
        return async (repository: OwnerRepository) => {
            // 新しい匿名所有者を作成
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
            }, { $set: {
                name_first: args.name_first,
                name_last: args.name_last,
                email: args.email,
                tel: args.tel,
            } });
            if (option.isEmpty) throw new Error("owner not found.");
        };
    }

    export function getAdministrator() {
        return async (repository: AdministratorOwnerRepository) => {
            let option = await repository.findOne();
            if (option.isEmpty) throw new Error("administrator owner not found.");

            return option.get();
        };
    }
}

let i: OwnerService = interpreter;
export default i;