import mongoose = require("mongoose");
import monapt = require("monapt");
import Transaction from "../../model/transaction";
import ObjectId from "../../model/objectId";
import TransactionRepository from "../transaction";
import TransactionModel from "./mongoose/model/transaction";
import * as TransactionFactory from "../../factory/transaction";

class TransactionRepositoryInterpreter implements TransactionRepository {
    public connection: mongoose.Connection;

    async find(conditions: Object) {
        let model = this.connection.model(TransactionModel.modelName, TransactionModel.schema);
        let docs = <Array<any>>await model.find()
            .where(conditions)
            .populate("owner")
            .lean()
            .exec();

        return docs.map(TransactionFactory.create);
    }

    async findById(id: ObjectId) {
        let model = this.connection.model(TransactionModel.modelName, TransactionModel.schema);
        let doc = <any>await model.findOne()
            .where("_id").equals(id)
            .populate("owners").lean().exec();

        return (doc) ? monapt.Option(TransactionFactory.create(doc)) : monapt.None;
    }

    async findOneAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(TransactionModel.modelName, TransactionModel.schema);
        let doc = <any>await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).lean().exec();

        return (doc) ? monapt.Option(TransactionFactory.create(doc)) : monapt.None;
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