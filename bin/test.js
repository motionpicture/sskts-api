"use strict";
const request = require("request");
let options;
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
// options = {
//     url: "http://localhost:8080/transaction/586c8710c4dfe7189814a630/authorize",
//     body: {
//         password: "password",
//         assets: ["586b77476620961178fdeb75", "586b77476620961178fdeb76"],
//     },
//     json: true
// };
options = {
    url: "http://localhost:8080/transaction/586d050012c62224c8568d52/authorize/coaSeatReservation",
    body: {
        password: "password",
        authorizations: [
            {
                coa_tmp_reserve_num: "999",
                // performance: "001201701018513021010",
                section: "0",
                seat_code: "HC",
                ticket_code: "10",
                ticket_name_ja: "一般",
                ticket_name_en: "",
                ticket_name_kana: "",
                std_price: 1000,
                add_price: 200,
                dis_price: 0,
                price: 1200,
            },
            {
                coa_tmp_reserve_num: "999",
                performance: "001201701018513021010",
                section: "0",
                seat_code: "Ｃ－１０",
                ticket_code: "10",
                ticket_name_ja: "一般",
                ticket_name_en: "",
                ticket_name_kana: "",
                std_price: 1000,
                add_price: 200,
                dis_price: 0,
                price: 1200,
            }
        ],
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
