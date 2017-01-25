import sendgrid = require("sendgrid");
import EmailService from "../email";
import Email from "../../model/email";

namespace interpreter {
    /** メール送信 */
    export async function send(email: Email) {
        let mail = new sendgrid.mail.Mail(
            new sendgrid.mail.Email(email.from),
            email.subject,
            new sendgrid.mail.Email(email.to),
            new sendgrid.mail.Content("text/html", email.body)
        );

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