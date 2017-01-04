import request = require("request");

let options: request.Options;

// options = {
//     url: "http://localhost:8080/owner/create",
//     body: {
//         group: "ANONYMOUS",
//     },
//     json: true
// };

// options = {
//     url: `http://localhost:8080/owner/5869c2c316aaa805d835f94a/update`,
//     // url: `http://localhost:8080/owner/5869c2c316aaa805d835f94b/update`,
//     body: {
//         email: "ilovegadd@gmail.com",
//     },
//     json: true
// };

// options = {
//     url: "http://localhost:8080/transaction/start",
//     body: {
//         owners: ["5868e16789cc75249cdbfa4b", "5869c2c316aaa805d835f94a"]
//     },
//     json: true
// };

options = {
    url: "http://localhost:8080/transaction/586c8710c4dfe7189814a630/authorize",
    body: {
        password: "password",
        assets: ["586b77476620961178fdeb75", "586b77476620961178fdeb76"],
    },
    json: true
};

// options = {
//     url: "http://localhost:8080/transaction/586c8710c4dfe7189814a630/unauthorize",
//     body: {
//         password: "password",
//         coa_tmp_reserve_num: "162",
//     },
//     json: true
// };

// options = {
//     url: "http://localhost:8080/transaction/586c8710c4dfe7189814a630/close",
//     body: {
//         password: "password"
//     },
//     json: true
// };

request.post(options, (error, response, body) => {
    console.log(body);
});
