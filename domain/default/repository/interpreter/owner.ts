import mongoose = require("mongoose");
import monapt = require("monapt");

import ObjectId from "../../model/objectId";
import Owner from "../../model/owner";
import AdministratorOwner from "../../model/owner/administrator";
import OwnerGroup from "../../model/ownerGroup";

import OwnerRepository from "../owner";
import OwnerModel from "./mongoose/model/owner";

class OwnerRepositoryInterpreter implements OwnerRepository {
    public connection: mongoose.Connection;

    async find(conditions: Object) {
        let model = this.connection.model(OwnerModel.modelName, OwnerModel.schema);
        return <Array<Owner>> await model.find({ $and: [conditions] }).lean().exec();
    }

    async findById(id: ObjectId) {
        let model = this.connection.model(OwnerModel.modelName, OwnerModel.schema);
        let owner = <Owner> await model.findOne({ _id: id }).lean().exec();

        return (owner) ? monapt.Option(owner) : monapt.None;
    }

    async findAdministrator() {
        let model = this.connection.model(OwnerModel.modelName, OwnerModel.schema);
        let owner = <AdministratorOwner> await model.findOne({ group: OwnerGroup.ADMINISTRATOR }).lean().exec();

        return (owner) ? monapt.Option(owner) : monapt.None;
    }

    async findOneAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(OwnerModel.modelName, OwnerModel.schema);
        let owner = <Owner> await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).lean().exec();

        return (owner) ? monapt.Option(owner) : monapt.None;
    }

    async store(owner: Owner) {
        let model = this.connection.model(OwnerModel.modelName, OwnerModel.schema);
        await model.findOneAndUpdate({ _id: owner._id }, owner, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}

let repo = new OwnerRepositoryInterpreter();

export default (connection: mongoose.Connection) => {
    repo.connection = connection;
    return repo;
}