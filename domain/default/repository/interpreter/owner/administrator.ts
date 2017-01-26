import mongoose = require("mongoose");
import monapt = require("monapt");
import AdministratorOwnerRepository from "../../owner/administrator";

import * as OwnerFactory from "../../../factory/owner";
import OwnerGroup from "../../../model/ownerGroup";
import OwnerModel from "../mongoose/model/owner";

class AdministratorOwnerRepositoryInterpreter implements AdministratorOwnerRepository {
    public connection: mongoose.Connection;

    async findOne() {
        let model = this.connection.model(OwnerModel.modelName, OwnerModel.schema);
        let doc = await model.findOne({ group: OwnerGroup.ADMINISTRATOR }).exec();
        if (!doc) return monapt.None;

        let owner = OwnerFactory.createAdministrator({
            _id: doc.get("_id"),
            name: doc.get("name"),
        });

        return monapt.Option(owner);
    }
}

let repo = new AdministratorOwnerRepositoryInterpreter();

export default (connection: mongoose.Connection) => {
    repo.connection = connection;
    return repo;
}