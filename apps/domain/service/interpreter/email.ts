import sendgrid = require("sendgrid");
import EmailService from "../email";
import Email from "../../model/email";

namespace interpreter {
    /** メール送信 */
    export async function send(email: Email) {
        // TODO メール送信
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

        let response = await sg.API(request);
        console.log("response is", response);
    }
}

let i: EmailService = interpreter;
export default i;