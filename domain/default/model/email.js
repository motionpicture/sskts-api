"use strict";
class Email {
    constructor(_id, from, to, subject, body) {
        this._id = _id;
        this.from = from;
        this.to = to;
        this.subject = subject;
        this.body = body;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Email;
