import mongoose = require("mongoose");
import monapt = require("monapt");
import Transaction from "../../model/transaction";
import ObjectId from "../../model/objectId";
import TransactionRepository from "../transaction";
import TransactionModel from "./mongoose/model/transaction";

class TransactionRepositoryInterpreter implements TransactionRepository {
    public connection: mongoose.Connection;

    async find(conditions: Object) {
        let model = this.connection.model(TransactionModel.modelName, TransactionModel.schema);
        return <Array<Transaction>>await model.find(conditions)
            .populate("owner")
            .lean().exec();
    }

    async findById(id: ObjectId) {
        let model = this.connection.model(TransactionModel.modelName, TransactionModel.schema);
        let transaction = <Transaction>await model.findOne({ _id: id })
            .populate("owners").lean().exec();

        return (transaction) ? monapt.Option(transaction) : monapt.None;
    }

    async findOneAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(TransactionModel.modelName, TransactionModel.schema);
        let transaction = <Transaction>await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).lean().exec();

        return (transaction) ? monapt.Option(transaction) : monapt.None;
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