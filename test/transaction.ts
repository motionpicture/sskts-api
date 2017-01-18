import request = require("request-promise-native");
// import moment = require("moment");


async function main() {
    let body: any;

    // 一般所有者作成
    body = await request.post({
        url: "http://localhost:8080/owner/anonymous/create",
        body: {
            group: "ANONYMOUS",
        },
        json: true,
        simple: false,
    });
    if (!body.success) throw new Error(body.message); 
    let owner = body.owner;
    console.log("owner:", owner);


    // 取引開始
    body = await request.post({
        url: "http://localhost:8080/transaction/start",
        body: {
            owners: ["5868e16789cc75249cdbfa4b", owner._id]
        },
        json: true,
        simple: false,
    });
    if (!body.success) throw new Error(body.message); 
    let transaction = body.transaction;
    console.log("transaction:", transaction);


    // GMOオーソリ追加
    body = await request.post({
        url: `http://localhost:8080/transaction/${transaction._id}/addGMOAuthorization`,
        body: {
            password: "password",
        },
        json: true
    });
    if (!body.success) throw new Error("fail in addGMOAuthorization.");
    console.log("addGMOAuthorization result:", body);


    // 取引成立
    body = await request.post({
        url: `http://localhost:8080/transaction/${transaction._id}/close`,
        body: {
            password: "password"
        },
        json: true,
        simple: false,
    });
    if (!body.success) throw new Error(body.message); 
    // let owner = body.owner;
    console.log("close result:", body);
}


// options = {
//     url: "http://localhost:8080/transaction/586d8cc2fe0c971cd4b714f2/unauthorize",
//     body: {
//         password: "password",
//         authorizations: ["586d9190ffe1bd0f9c2281cb", "586d9190ffe1bd0f9c2281cc"],
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

main().then(() => {
    console.log("main processed.");
}).catch((err) => {
    console.error(err.message);
});