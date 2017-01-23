import EmailService from "../apps/domain/service/interpreter/email";
import Email from "../apps/domain/model/email";

let email = new Email(
    "test",
    "test@localhost",
    "ilovegadd@gmail.com",
    "test subject",
    "test body"
);
EmailService.send(email).then(() => {
    console.log("sent.");
}).catch((err) => {
    console.error(err);
});
