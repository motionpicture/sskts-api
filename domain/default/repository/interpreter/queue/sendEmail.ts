import mongoose = require("mongoose");
import monapt = require("monapt");
import SendEmailQueueRepository from "../../queue/sendEmail";

import * as QueueFactory from "../../../factory/queue";
import QueueGroup from "../../../model/queueGroup";
import QueueModel from "../mongoose/model/queue";

class SendEmailQueueRepositoryInterpreter implements SendEmailQueueRepository {
    public connection: mongoose.Connection;

    async findOneAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let doc = await model.findOneAndUpdate({
            $and: [
                { group: QueueGroup.SEND_EMAIL },
                conditions
            ]
        }, update, {
                new: true,
                upsert: false
            }).exec();
        if (!doc) return monapt.None;

        return monapt.Option(QueueFactory.createSendEmail({
            _id: doc.get("_id"),
            email: doc.get("email"),
            status: doc.get("status"),
            executed_at: doc.get("executed_at"),
            count_try: doc.get("count_try")
        }));
    }
}

let repo = new SendEmailQueueRepositoryInterpreter();

export default (connection: mongoose.Connection) => {
    repo.connection = connection;
    return repo;
}