"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const notification_1 = require("../domain/default/service/interpreter/notification");
const sendEmail_1 = require("../domain/default/repository/interpreter/queue/sendEmail");
const queueStatus_1 = require("../domain/default/model/queueStatus");
const mongoose = require("mongoose");
mongoose.set('debug', true);
mongoose.connect(process.env.MONGOLAB_URI);
let count = 0;
setInterval(() => __awaiter(this, void 0, void 0, function* () {
    if (count > 10)
        return;
    count++;
    try {
        let queueRepository = sendEmail_1.default(mongoose.connection);
        let option = yield queueRepository.findOneAndUpdate({
            status: queueStatus_1.default.UNEXECUTED,
        }, {
            status: queueStatus_1.default.RUNNING
        });
        if (!option.isEmpty) {
            let queue = option.get();
            console.log("queue is", queue);
            yield notification_1.default.sendEmail(queue.email)
                .then(() => __awaiter(this, void 0, void 0, function* () {
                yield queueRepository.findOneAndUpdate({
                    _id: queue._id
                }, {
                    status: queueStatus_1.default.EXECUTED
                });
            }))
                .catch((err) => __awaiter(this, void 0, void 0, function* () {
                console.error(err);
                yield queueRepository.findOneAndUpdate({
                    _id: queue._id
                }, {
                    status: queueStatus_1.default.UNEXECUTED,
                });
            }));
        }
    }
    catch (error) {
        console.error(error.message);
    }
    count--;
}), 500);
