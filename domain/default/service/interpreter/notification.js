"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const sendgrid = require("sendgrid");
class NotificationServiceInterpreter {
    sendEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            let mail = new sendgrid.mail.Mail(new sendgrid.mail.Email(email.from), email.subject, new sendgrid.mail.Email(email.to), new sendgrid.mail.Content("text/html", email.content));
            let sg = sendgrid(process.env.SENDGRID_API_KEY);
            let request = sg.emptyRequest({
                host: "api.sendgrid.com",
                method: "POST",
                path: "/v3/mail/send",
                headers: {},
                body: mail.toJSON(),
                queryParams: {},
                test: false,
                port: ""
            });
            let response = yield sg.API(request);
            console.log("response is", response);
        });
    }
    ;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new NotificationServiceInterpreter();
