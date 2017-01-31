import mongoose = require("mongoose");
import monapt = require("monapt");

import QueueRepository from "../queue";

import ObjectId from "../../model/objectId";
import Queue from "../../model/queue";
import SettleAuthorizationQueue from "../../model/queue/settleAuthorization";
import QueueGroup from "../../model/queueGroup";
import SendEmailQueue from "../../model/queue/sendEmail";
import ExpireTransactionQueue from "../../model/queue/expireTransaction";
import AuthorizationGroup from "../../model/authorizationGroup";
import GMOAuthorization from "../../model/authorization/gmo";
import COASeatReservationAuthorization from "../../model/authorization/coaSeatReservation";
import * as QueueFactory from "../../factory/queue";

import QueueModel from "./mongoose/model/queue";

class QueueRepositoryInterpreter implements QueueRepository {
    public connection: mongoose.Connection;

    async find(conditions: Object) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let docs = await model.find().where(conditions).exec();
        await docs.map((doc) => {
            console.log(doc);
        });
        return [];
    }

    async findById(id: ObjectId) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let doc = <any>await model.findOne()
            .where("_id").equals(id).lean().exec();

        return (doc) ? monapt.Option(QueueFactory.create(doc)) : monapt.None;
    }

    async findOneAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let doc = <any>await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).lean().exec();

        return (doc) ? monapt.Option(QueueFactory.create(doc)) : monapt.None;
    }

    async findOneSendEmailAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let queue = <SendEmailQueue>await model.findOneAndUpdate({
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

    async findOneSettleAuthorizationAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let doc = await model.findOneAndUpdate(
            {
                $and: [
                    {
                        "group": QueueGroup.SETTLE_AUTHORIZATION,
                    },
                    conditions
                ]
            },
            update,
            {
                new: true,
                upsert: false
            })
            .exec();
        if (!doc) return monapt.None;

        return monapt.Option(new SettleAuthorizationQueue(
            doc.get("_id"),
            doc.get("status"),
            doc.get("executed_at"),
            doc.get("count_try"),
            doc.get("authorization"),
        ));
    }

    async findOneSettleGMOAuthorizationAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let doc = <any>await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        })
            .where({
                "group": QueueGroup.SETTLE_AUTHORIZATION,
                "authorization.group": AuthorizationGroup.GMO
            }).lean().exec();

        return (doc) ? monapt.Option(QueueFactory.createSettleAuthorization<GMOAuthorization>(doc)) : monapt.None;
    }

    async findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let doc = <any>await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        })
            .where({
                "group": QueueGroup.SETTLE_AUTHORIZATION,
                "authorization.group": AuthorizationGroup.COA_SEAT_RESERVATION
            }).lean().exec();

        return (doc) ? monapt.Option(QueueFactory.createSettleAuthorization<COASeatReservationAuthorization>(doc)) : monapt.None;
    }

    async findOneCancelGMOAuthorizationAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let queue = <{
            _id: ObjectId,
            authorization: GMOAuthorization
        }>await model.findOneAndUpdate({
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
        let queue = <ExpireTransactionQueue>await model.findOneAndUpdate({
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