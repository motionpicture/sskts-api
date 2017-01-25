import mongoose = require("mongoose");
import monapt = require("monapt");
import AdministratorOwnerRepository from "../../owner/administrator";

import * as OwnerFactory from "../../../factory/owner";
import OwnerGroup from "../../../model/ownerGroup";
import OwnerModel from "../mongoose/model/owner";

let db = mongoose.createConnection(process.env.MONGOLAB_URI);
let ownerModel = db.model(OwnerModel.modelName, OwnerModel.schema);

namespace interpreter {
    export async function findOne() {
        let doc = await ownerModel.findOne({ group: OwnerGroup.ADMINISTRATOR }).exec();
        if (!doc) return monapt.None;

        let owner = OwnerFactory.createAdministrator({
            _id: doc.get("_id"),
            name: doc.get("name"),
        });

        return monapt.Option(owner);
    }
}

let i: AdministratorOwnerRepository = interpreter;
export default i;