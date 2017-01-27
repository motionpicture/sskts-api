import mongoose = require("mongoose");
import monapt = require("monapt");

import QueueRepository from "../queue";

import ObjectId from "../../model/objectId";
import Queue from "../../model/queue";
import QueueGroup from "../../model/queueGroup";
import SendEmailQueue from "../../model/queue/sendEmail";
import ExpireTransactionQueue from "../../model/queue/expireTransaction";
import AuthorizationGroup from "../../model/authorizationGroup";
import GMOAuthorization from "../../model/authorization/gmo";
import COASeatReservationAuthorization from "../../model/authorization/coaSeatReservation";

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

    async findById(id: ObjectId) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let queue = <Queue> await model.findOne({ _id: id }).lean().exec();

        return (queue) ? monapt.Option(queue) : monapt.None;
    }

    async findOneAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let queue = <Queue> await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).lean().exec();

        return (queue) ? monapt.Option(queue) : monapt.None;
    }

    async findOneSendEmailAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let queue = <SendEmailQueue> await model.findOneAndUpdate({
            $and: [
                { group: QueueGroup.SEND_EMAIL },
                conditions
            ]
        }, update, {
                new: true,
                upsert: false
            }).lean().exec();

        return (queue) ? monapt.Option(queue) : monapt.None;
    }

    async findOneSettleGMOAuthorizationAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let queue = <{
            _id: ObjectId,
            authorization: GMOAuthorization
        }> await model.findOneAndUpdate({
            $and: [
                {
                    "group": QueueGroup.SETTLE_AUTHORIZATION,
                    "authorization.group": AuthorizationGroup.GMO
                },
                conditions
            ]
        }, update, {
                new: true,
                upsert: false
            }).lean().exec();

        return (queue) ? monapt.Option(queue) : monapt.None;
    }

    async findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let queue = <{
            _id: ObjectId,
            authorization: COASeatReservationAuthorization
        }> await model.findOneAndUpdate({
            $and: [
                {
                    "group": QueueGroup.SETTLE_AUTHORIZATION,
                    "authorization.group": AuthorizationGroup.COA_SEAT_RESERVATION
                },
                conditions
            ]
        }, update, {
                new: true,
                upsert: false
            }).lean().exec();

        return (queue) ? monapt.Option(queue) : monapt.None;
    }

    async findOneCancelGMOAuthorizationAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let queue = <{
            _id: ObjectId,
            authorization: GMOAuthorization
        }> await model.findOneAndUpdate({
            $and: [
                {
                    "group": QueueGroup.CANCEL_AUTHORIZATION,
                    "authorization.group": AuthorizationGroup.GMO
                },
                conditions
            ]
        }, update, {
                new: true,
                upsert: false
            }).lean().exec();

        return (queue) ? monapt.Option(queue) : monapt.None;
    }

    async findOneExpireTransactionAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let queue = <ExpireTransactionQueue> await model.findOneAndUpdate({
            $and: [
                { group: QueueGroup.EXPIRE_TRANSACTION },
                conditions
            ]
        }, update, {
                new: true,
                upsert: false
            }).lean().exec();

        return (queue) ? monapt.Option(queue) : monapt.None;
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