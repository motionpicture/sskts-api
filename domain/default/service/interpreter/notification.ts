import NotificationService from "../notification";
import sendgrid = require("sendgrid");
import EmailNotification from "../../model/notification/email";

class NotificationServiceInterpreter implements NotificationService {
    /**
     * メール送信
     * https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/errors.html
     */
    async sendEmail(email: EmailNotification) {
        let mail = new sendgrid.mail.Mail(
            new sendgrid.mail.Email(email.from),
            email.subject,
            new sendgrid.mail.Email(email.to),
            new sendgrid.mail.Content("text/html", email.content)
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