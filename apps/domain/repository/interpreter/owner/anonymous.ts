import monapt = require("monapt");
import { Anonymous as AnonymousOwner } from "../../../model/Owner";
import OwnerGroup from "../../../model/OwnerGroup";
import AnonymousOwnerRepository from "../../owner/anonymous";
import OwnerModel from "../mongoose/model/owner";

namespace interpreter {
    export async function find(conditions: Object) {
        let docs = await OwnerModel.find({ $and: [conditions, { group: OwnerGroup.ANONYMOUS }] }).exec();
        return docs.map((doc) => {
            return new AnonymousOwner(
                doc.get("_id"),
                doc.get("name_first"),
                doc.get("name_last"),
                doc.get("email"),
                doc.get("tel"),
            );
        });
    }

    export async function findById(id: string) {
        let doc = await OwnerModel.findOne({ _id: id, group: OwnerGroup.ANONYMOUS }).exec();
        if (!doc) return monapt.None;

        return monapt.Option(new AnonymousOwner(
            doc.get("_id"),
            doc.get("name_first"),
            doc.get("name_last"),
            doc.get("email"),
            doc.get("tel"),
        ));
    }

    export async function findOneAndUpdate(conditions: Object, update: Object) {
        let doc = await OwnerModel.findOneAndUpdate({ $and: [conditions, { group: OwnerGroup.ANONYMOUS }] }, update, {
            new: true,
            upsert: false
        }).exec();
        if (!doc) return monapt.None;

        return monapt.Option(new AnonymousOwner(
            doc.get("_id"),
            doc.get("name_first"),
            doc.get("name_last"),
            doc.get("email"),
            doc.get("tel"),
        ));
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