import mongoose = require("mongoose");
import monapt = require("monapt");
import Queue from "../../model/queue";
import * as QueueFactory from "../../factory/queue";
import QueueRepository from "../queue";
import QueueModel from "./mongoose/model/queue";

class QueueRepositoryInterpreter implements QueueRepository {
    public connection: mongoose.Connection;

    async find(conditions: Object) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let docs = await model.find(conditions).exec();
        await docs.map((doc) => {
            console.log(doc);
        });
        return [];
    }
    async findById(id: string) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let doc = await model.findOne({ _id: id }).exec();
        if (!doc) return monapt.None;

        return monapt.None;
    }

    async findOneAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let doc = await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).exec();
        if (!doc) return monapt.None;

        return monapt.Option(QueueFactory.create({
            _id: doc.get("_id"),
            group: doc.get("group"),
            status: doc.get("status"),
            executed_at: doc.get("executed_at"),
            count_try: doc.get("count_try")
        }));
    }

    async store(queue: Queue) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        await model.findOneAndUpdate({ _id: queue._id }, queue, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}

let repo = new QueueRepositoryInterpreter();

export default (connection: mongoose.Connection) => {
    repo.connection = connection;
    return repo;
}