import mongoose = require("mongoose");
import monapt = require("monapt");

import QueueRepository from "../queue";

import Queue from "../../model/queue";
import QueueGroup from "../../model/queueGroup";
import AuthorizationGroup from "../../model/authorizationGroup";

import * as AuthorizationFactory from "../../factory/authorization";
import * as QueueFactory from "../../factory/queue";
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

    async findOneSendEmailAndUpdate(conditions: Object, update: Object) {
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

    async findOneSettleGMOAuthorizationAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let doc = await model.findOneAndUpdate({
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
            }).exec();
        if (!doc) return monapt.None;

        let authorization = AuthorizationFactory.createGMO({
            _id: doc.get("authorization")._id,
            price: doc.get("authorization").price,
            owner_from: doc.get("authorization").owner_from,
            owner_to: doc.get("authorization").owner_to,
            gmo_shop_id: doc.get("authorization").gmo_shop_id,
            gmo_shop_pass: doc.get("authorization").gmo_shop_pass,
            gmo_order_id: doc.get("authorization").gmo_order_id,
            gmo_amount: doc.get("authorization").gmo_amount,
            gmo_access_id: doc.get("authorization").gmo_access_id,
            gmo_access_pass: doc.get("authorization").gmo_access_pass,
            gmo_job_cd: doc.get("authorization").gmo_job_cd,
            gmo_pay_type: doc.get("authorization").gmo_pay_type,
        });

        return monapt.Option({
            _id: doc.get("_id"),
            authorization: authorization
        });
    }

    async findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions: Object, update: Object) {
        let model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        let doc = await model.findOneAndUpdate({
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
            }).exec();
        if (!doc) return monapt.None;

        let authorization = AuthorizationFactory.createCOASeatReservation({
            _id: doc.get("authorization")._id,
            coa_tmp_reserve_num: doc.get("authorization").coa_tmp_reserve_num,
            price: doc.get("authorization").price,
            owner_from: doc.get("authorization").owner_from,
            owner_to: doc.get("authorization").owner_to,
            seats: doc.get("authorization").seats,
        });

        return monapt.Option({
            _id: doc.get("_id"),
            authorization: authorization
        });
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