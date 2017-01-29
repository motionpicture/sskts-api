import mongoose = require("mongoose");
import monapt = require("monapt");
import Transaction from "../../model/transaction";
import ObjectId from "../../model/objectId";
import TransactionRepository from "../transaction";
import TransactionModel from "./mongoose/model/transaction";

class TransactionRepositoryInterpreter implements TransactionRepository {
    public connection: mongoose.Connection;

    private createFromDocument(doc: mongoose.Document) {
        return new Transaction(
            doc.get("_id"),
            doc.get("status"),
            doc.get("events"),
            doc.get("owners"),
            doc.get("queues"),
            doc.get("expired_at"),
            doc.get("inquiry_id"),
            doc.get("inquiry_pass"),
            doc.get("queues_status"),
        );
    }

    async find(conditions: Object) {
        let model = this.connection.model(TransactionModel.modelName, TransactionModel.schema);
        let docs = await model.find(conditions)
            .populate("owner")
            .exec();

        return docs.map(this.createFromDocument);
    }

    async findById(id: ObjectId) {
        let model = this.connection.model(TransactionModel.modelName, TransactionModel.schema);
        let doc = await model.findOne({ _id: id })
            .populate("owners").exec();

        return (doc) ? monapt.Option(this.createFromDocument(doc)) : monapt.None;
    }

    async findOneAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(TransactionModel.modelName, TransactionModel.schema);
        let doc = await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).exec();

        return (doc) ? monapt.Option(this.createFromDocument(doc)) : monapt.None;
    }

    async store(transaction: Transaction) {
        let model = this.connection.model(TransactionModel.modelName, TransactionModel.schema);
        await model.findOneAndUpdate({ _id: transaction._id }, transaction, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}

let repo = new TransactionRepositoryInterpreter();

export default (connection: mongoose.Connection) => {
    repo.connection = connection;
    return repo;
}