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
var interpreter;
(function (interpreter) {
    function send(email) {
        return __awaiter(this, void 0, void 0, function* () {
            let helper = sendgrid.mail;
            let from_email = new helper.Email(email.from);
            let to_email = new helper.Email(email.to);
            let subject = email.subject;
            let content = new helper.Content("text/plain", email.body);
            let mail = new helper.Mail(from_email, subject, to_email, content);
            process.env.SENDGRID_API_KEY = "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";
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
    interpreter.send = send;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
