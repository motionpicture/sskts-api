"use strict";
const request = require("request");
// let options = {
//     url: 'http://localhost:8080/owner/create',
//     body: {
//         group: "ANONYMOUS",
//     },
//     json: true
// };
let options = {
    url: `http://localhost:8080/owner/5869c2c316aaa805d835f94a/update`,
    // url: `http://localhost:8080/owner/5869c2c316aaa805d835f94b/update`,
    body: {
        email: "ilovegadd@gmail.com",
    },
    json: true
};
request.post(options, (error, response, body) => {
    console.log(body);
});
