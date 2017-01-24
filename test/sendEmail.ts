import EmailService from "../domain/default/service/interpreter/email";
import Email from "../domain/default/model/email";

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
