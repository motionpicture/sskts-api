import mongoose = require("mongoose");
import monapt = require("monapt");

import QueueRepository from "../queue";

import ObjectId from "../../model/objectId";
import Queue from "../../model/queue";
import QueueGroup from "../../model/queueGroup";
import AuthorizationGroup from "../../model/authorizationGroup";
import GMOAuthorization from "../../model/authorization/gmo";
import COASeatReservationAuthorization from "../../model/authorization/coaSeatReservation";
import NotificationPushQueue from "../../model/queue/notificationPush";
import EmailNotification from "../../model/notification/email";
import NotificationGroup from "../../model/notificationGroup";

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
        let queue = <NotificationPushQueue<EmailNotification>>await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        })
            .where({
                "group": QueueGroup.NOTIFICATION_PUSH,
                "notification.group": NotificationGroup.EMAIL
            }).lean().exec();

        return (queue) ? monapt.Option(queue) : monapt.None;
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
            })
            .lean().exec();

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
            })
            .lean().exec();

        return (doc) ? monapt.Option(QueueFactory.createSettleAuthorization<COASeatReservationAuthorization>(doc)) : monapt.None;
    }

    async findOneCancelGMOAuthorizationAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let doc = <any>await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        })
            .where({
                "group": QueueGroup.CANCEL_AUTHORIZATION,
                "authorization.group": AuthorizationGroup.GMO
            })
            .lean().exec();

        return (doc) ? monapt.Option(QueueFactory.createCancelAuthorization<GMOAuthorization>(doc)) : monapt.None;
    }

    async findOneCancelCOASeatReservationAuthorizationAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let doc = <any>await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        })
            .where({
                "group": QueueGroup.CANCEL_AUTHORIZATION,
                "authorization.group": AuthorizationGroup.COA_SEAT_RESERVATION
            })
            .lean().exec();

        return (doc) ? monapt.Option(QueueFactory.createCancelAuthorization<COASeatReservationAuthorization>(doc)) : monapt.None;
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