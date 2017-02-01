"use strict";
const transactionEventGroup_1 = require("./transactionEventGroup");
const authorizationGroup_1 = require("./authorizationGroup");
const monapt = require("monapt");
class Transaction {
    constructor(_id, status, events, owners, queues, expired_at, inquiry_theater, inquiry_id, inquiry_pass, queues_status) {
        this._id = _id;
        this.status = status;
        this.events = events;
        this.owners = owners;
        this.queues = queues;
        this.expired_at = expired_at;
        this.inquiry_theater = inquiry_theater;
        this.inquiry_id = inquiry_id;
        this.inquiry_pass = inquiry_pass;
        this.queues_status = queues_status;
    }
    getCoaSeatReservationAuthorization() {
        let authorization = this.authorizations().find((authorization) => {
            return (authorization.group === authorizationGroup_1.default.COA_SEAT_RESERVATION);
        });
        return (authorization) ? monapt.Option(authorization) : monapt.None;
    }
    authorizations() {
        let authorizations = this.events.filter((event) => {
            return event.group === transactionEventGroup_1.default.AUTHORIZE;
        }).map((event) => {
            return event.authorization;
        });
        let removedAuthorizationIds = this.events.filter((event) => {
            return event.group === transactionEventGroup_1.default.UNAUTHORIZE;
        }).map((event) => {
            return event.authorization._id.toString();
        });
        return authorizations.filter((authorization) => {
            return removedAuthorizationIds.indexOf(authorization._id.toString()) < 0;
        });
    }
    notifications() {
        let notifications = this.events.filter((event) => {
            return event.group === transactionEventGroup_1.default.NOTIFICATION_ADD;
        }).map((event) => {
            return event.notification;
        });
        let removedNotificationIds = this.events.filter((event) => {
            return event.group === transactionEventGroup_1.default.NOTIFICATION_REMOVE;
        }).map((event) => {
            return event.notification._id.toString();
        });
        return notifications.filter((notification) => {
            return removedNotificationIds.indexOf(notification._id.toString()) < 0;
        });
    }
    isInquiryAvailable() {
        return (this.inquiry_theater && this.inquiry_id && this.inquiry_pass);
    }
    canBeClosed() {
        let authorizations = this.authorizations();
        let pricesByOwner = {};
        authorizations.forEach((authorization) => {
            if (!pricesByOwner[authorization.owner_from.toString()])
                pricesByOwner[authorization.owner_from.toString()] = 0;
            if (!pricesByOwner[authorization.owner_to.toString()])
                pricesByOwner[authorization.owner_to.toString()] = 0;
            pricesByOwner[authorization.owner_from.toString()] -= authorization.price;
            pricesByOwner[authorization.owner_to.toString()] += authorization.price;
        });
        return Object.keys(pricesByOwner).every((ownerId) => {
            return pricesByOwner[ownerId] === 0;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Transaction;
