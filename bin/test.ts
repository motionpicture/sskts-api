import request = require("request");
// import moment = require("moment");

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

options = {
    url: "http://localhost:8080/transaction/start",
    body: {
        owners: ["5868e16789cc75249cdbfa4b", "5869c2c316aaa805d835f94a"]
    },
    json: true
};

options = {
    url: "http://localhost:8080/transaction/5872f826ce42e626d8bd51ca/authorize",
    body: {
        password: "password",
        authorization_group: 2,
        authorizations: [
            {
                coa_tmp_reserve_num: "999",
                performance: "001201701018513021010",
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
//     url: "http://localhost:8080/transaction/586d8cc2fe0c971cd4b714f2/unauthorize",
//     body: {
//         password: "password",
//         authorizations: ["586d9190ffe1bd0f9c2281cb", "586d9190ffe1bd0f9c2281cc"],
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

// options = {
//     url: "http://localhost:8080/transaction/586ee23af94ed12254c284fd/update",
//     body: {
//         password: "password",
//         expired_at: moment().add(+30, 'minutes').unix()
//     },
//     json: true
// };

request.post(options, (error, response, body) => {
    console.log("request processed.", error, (response) ? response.statusCode : undefined, body);
});
