import NotificationService from "../notification";
import sendgrid = require("sendgrid");
import Email from "../../model/email";

class NotificationServiceInterpreter implements NotificationService {
    /** メール送信 */
    async sendEmail(email: Email) {
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
    };
}

export default new NotificationServiceInterpreter();