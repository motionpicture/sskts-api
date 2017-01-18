import monapt = require("monapt");
import Transaction from "../../model/transaction";
import TransactionRepository from "../transaction";
import TheaterModel from "./mongoose/model/transaction";

namespace interpreter {
    export async function find(conditions: Object) {
        let docs = await TheaterModel.find(conditions).exec();
        await docs.map((doc) => {
            console.log(doc);
        });
        return [];
    }
    export async function findById(id: string) {
        let doc = await TheaterModel.findOne({ _id: id }).exec();
        if (!doc) return monapt.None;

        return monapt.None;
    }

    export async function findOneAndUpdate(conditions: Object, update: Object) {
        let doc = await TheaterModel.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).exec();
        if (!doc) return monapt.None;

        return monapt.Option(new Transaction(
            doc.get("_id"),
            doc.get("password"),
            doc.get("status"),
            doc.get("events"),
            doc.get("owners"),
            doc.get("authorizations"),
            doc.get("expired_at"),
            doc.get("access_id"),
            doc.get("access_pass"),
        ));
    }

    export async function store(transaction: Transaction) {
        await TheaterModel.findOneAndUpdate({ _id: transaction._id }, transaction, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}

let i: TransactionRepository = interpreter;
export default i;