import monapt = require("monapt");
import AnonymousOwner from "../../../model/owner/anonymous";
import OwnerGroup from "../../../model/ownerGroup";
import AnonymousOwnerRepository from "../../owner/anonymous";
import * as OwnerFactory from "../../../factory/owner";
import OwnerModel from "../mongoose/model/owner";

namespace interpreter {
    export async function find(conditions: Object) {
        let docs = await OwnerModel.find({ $and: [conditions, { group: OwnerGroup.ANONYMOUS }] }).exec();
        return docs.map((doc) => {
            return OwnerFactory.createAnonymous({
                _id: doc.get("_id"),
                name_first: doc.get("name_first"),
                name_last: doc.get("name_last"),
                email: doc.get("email"),
                tel: doc.get("tel"),
            });
        });
    }

    export async function findById(id: string) {
        let doc = await OwnerModel.findOne({ _id: id, group: OwnerGroup.ANONYMOUS }).exec();
        if (!doc) return monapt.None;

        let owner = OwnerFactory.createAnonymous({
            _id: doc.get("_id"),
            name_first: doc.get("name_first"),
            name_last: doc.get("name_last"),
            email: doc.get("email"),
            tel: doc.get("tel"),
        });

        return monapt.Option(owner);
    }

    export async function findOneAndUpdate(conditions: Object, update: Object) {
        let doc = await OwnerModel.findOneAndUpdate({ $and: [conditions, { group: OwnerGroup.ANONYMOUS }] }, update, {
            new: true,
            upsert: false
        }).exec();
        if (!doc) return monapt.None;

        let owner = OwnerFactory.createAnonymous({
            _id: doc.get("_id"),
            name_first: doc.get("name_first"),
            name_last: doc.get("name_last"),
            email: doc.get("email"),
            tel: doc.get("tel"),
        });

        return monapt.Option(owner);
    }

    export async function store(owner: AnonymousOwner) {
        await OwnerModel.findOneAndUpdate({ _id: owner._id, group: OwnerGroup.ANONYMOUS }, owner, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}

let i: AnonymousOwnerRepository = interpreter;
export default i;