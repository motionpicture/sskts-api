import request = require("request");

// let options = {
//     url: "http://localhost:8080/owner/create",
//     body: {
//         group: "ANONYMOUS",
//     },
//     json: true
// };

// let options = {
//     url: `http://localhost:8080/owner/5869c2c316aaa805d835f94a/update`,
//     // url: `http://localhost:8080/owner/5869c2c316aaa805d835f94b/update`,
//     body: {
//         email: "ilovegadd@gmail.com",
//     },
//     json: true
// };

// let options = {
//     url: "http://localhost:8080/transaction/start",
//     body: {
//         owners: ["5868e16789cc75249cdbfa4b", "5869c2c316aaa805d835f94a"]
//     },
//     json: true
// };

// let options = {
//     url: "http://localhost:8080/transaction/5869f39ae5b370089c78f386/close",
//     body: {
//         password: "password"
//     },
//     json: true
// };

// let options = {
//     url: "http://localhost:8080/transaction/586c591c07e8e424881851fc/authorize",
//     body: {
//         password: "password",
//         assets: ["586b77476620961178fdeb73", "586b77476620961178fdeb74"],
//     },
//     json: true
// };

let options = {
    url: "http://localhost:8080/transaction/586c591c07e8e424881851fc/unauthorize",
    body: {
        password: "password",
        coa_tmp_reserve_num: "161",
    },
    json: true
};

request.post(options, (error, response, body) => {
    console.log(body);
});
