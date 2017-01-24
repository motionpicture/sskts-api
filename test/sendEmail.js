"use strict";
const email_1 = require("../domain/default/service/interpreter/email");
const email_2 = require("../domain/default/model/email");
let email = new email_2.default("test", "test@localhost", "ilovegadd@gmail.com", "test subject", "test body");
email_1.default.send(email).then(() => {
    console.log("sent.");
}).catch((err) => {
    console.error(err);
});
