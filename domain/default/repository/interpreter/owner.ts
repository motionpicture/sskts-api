import mongoose = require("mongoose");
import monapt = require("monapt");
import Owner from "../../model/owner";
import OwnerRepository from "../owner";
import * as OwnerFactory from "../../factory/owner";
import OwnerGroup from "../../model/ownerGroup";
import OwnerModel from "./mongoose/model/owner";

class OwnerRepositoryInterpreter implements OwnerRepository {
    public connection: mongoose.Connection;

    async find(conditions: Object) {
        let model = this.connection.model(OwnerModel.modelName, OwnerModel.schema);
        let docs = await model.find({ $and: [conditions] }).exec();
        return docs.map((doc) => {
            return OwnerFactory.create({
                _id: doc.get("_id"),
                group: doc.get("group")
            });
        });
    }

    async findById(id: string) {
        let model = this.connection.model(OwnerModel.modelName, OwnerModel.schema);
        let doc = await model.findOne({ _id: id }).exec();
        if (!doc) return monapt.None;

        let owner: Owner;
        switch (doc.get("group")) {
            // TODO
            // case OwnerGroup.ADMINISTRATOR:
            //     break;

            case OwnerGroup.ANONYMOUS:
                owner = OwnerFactory.createAnonymous({
                    _id: doc.get("_id"),
                    name_first: doc.get("name_first"),
                    name_last: doc.get("name_last"),
                    email: doc.get("email"),
                    tel: doc.get("tel"),
                });
                break;

            // TODO
            // case OwnerGroup.MEMBER:
            //     break;

            default:
                owner = OwnerFactory.create({
                    _id: doc.get("_id"),
                    group: doc.get("group")
                });
                break;
        }

        return monapt.Option(owner);
    }

    async findOneAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(OwnerModel.modelName, OwnerModel.schema);
        let doc = await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).exec();
        if (!doc) return monapt.None;

        let owner = OwnerFactory.create({
            _id: doc.get("_id"),
            group: doc.get("group")
        });

        return monapt.Option(owner);
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