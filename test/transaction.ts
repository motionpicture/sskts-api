import request = require("request-promise-native");
import GMO = require("@motionpicture/gmo-service");
GMO.initialize({
    endpoint: "https://pt01.mul-pay.jp",
});

import COA = require("@motionpicture/coa-service");
COA.initialize({
    endpoint: "http://coacinema.aa0.netvolante.jp",
    refresh_token: "eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkX2F0IjoxNDc5MjYwODQ4LCJhdXRoX2lkIjoiMzMxNSJ9.jx-w7D3YLP7UbY4mzJYC9xr368FiKWcpR2_L9mZfehQ"
});


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

    let ownerId4administrator = "5868e16789cc75249cdbfa4b";

    // 取引開始
    body = await request.post({
        url: "http://localhost:8080/transaction/start",
        body: {
            owners: [ownerId4administrator, owner._id]
        },
        json: true,
        simple: false,
    });
    if (!body.success) throw new Error(body.message); 
    let transaction = body.transaction;
    console.log("transaction:", transaction);


    // COA空席確認
    let getStateReserveSeatResult = await COA.getStateReserveSeatInterface.call({
        theater_code: "001",
        date_jouei: "20170120",
        title_code: "8513",
        title_branch_num: "0",
        time_begin: "1010",
        screen_code: "2"
    })
    let sectionCode = getStateReserveSeatResult.list_seat[0].seat_section;
    let freeSeatCodes = getStateReserveSeatResult.list_seat[0].list_free_seat.map((freeSeat) => {
        return freeSeat.seat_num;
    });
    console.log(freeSeatCodes);


    // COA仮予約
    let reserveSeatsTemporarilyResult = await COA.reserveSeatsTemporarilyInterface.call({
        theater_code: "001",
        date_jouei: "20170120",
        title_code: "8513",
        title_branch_num: "0",
        time_begin: "1010",
        screen_code: "2",
        list_seat: [{
            seat_section: sectionCode,
            seat_num: freeSeatCodes[0]
        },{
            seat_section: sectionCode,
            seat_num: freeSeatCodes[1]
        }]
    })
    console.log(reserveSeatsTemporarilyResult);


    // COAオーソリ追加
    body = await request.post({
        url: `http://localhost:8080/transaction/${transaction._id}/addCOAAuthorization`,
        body: {
            transaction_password: "password",
            owner_id: ownerId4administrator,
            coa_tmp_reserve_num: reserveSeatsTemporarilyResult.tmp_reserve_num,
            seats: reserveSeatsTemporarilyResult.list_tmp_reserve.map((tmpReserve) => {
                return {
                    performance: "001201701208513021010",
                    section: tmpReserve.seat_section,
                    seat_code: tmpReserve.seat_num,
                    ticket_code: "",
                }
            })
        },
        json: true,
        simple: false,
    });
    if (!body.success) throw new Error(body.message);
    let coaAuthorization = body.authorization;
    console.log("coaAuthorization:", coaAuthorization);


    // COAオーソリ削除
    body = await request.post({
        url: `http://localhost:8080/transaction/${transaction._id}/removeAuthorization`,
        body: {
            transaction_password: "password",
            owner_id: ownerId4administrator,
            authorization_id: coaAuthorization._id
        },
        json: true,
        simple: false,
    });
    if (!body.success) throw new Error(body.message);
    console.log("removeAuthorization result:", body);


    // GMOオーソリ取得
    let orderId = Date.now().toString();
    let amount = 1800;
    let entryTranResult = await GMO.CreditService.entryTranInterface.call({
        shop_id: "tshop00024015",
        shop_pass: "hf3wsuyy",
        order_id: orderId,
        job_cd: GMO.Util.JOB_CD_AUTH,
        amount: amount,
    });

    let execTranResult = await GMO.CreditService.execTranInterface.call({
        access_id: entryTranResult.access_id,
        access_pass: entryTranResult.access_pass,
        order_id: orderId,
        method: "1",
        card_no: "4111111111111111",
        expire: "2012",
        security_code: "123",
    });
    console.log(execTranResult);

    // GMOオーソリ追加
    body = await request.post({
        url: `http://localhost:8080/transaction/${transaction._id}/addGMOAuthorization`,
        body: {
            transaction_password: "password",
            owner_id: owner._id,
            gmo_shop_id: "tshop00024015",
            gmo_shop_password: "hf3wsuyy",
            gmo_order_id: orderId,
            gmo_amount: amount,
            gmo_access_id: entryTranResult.access_id,
            gmo_access_password: entryTranResult.access_pass,
            gmo_job_cd: GMO.Util.JOB_CD_SALES,
            gmo_pay_type: GMO.Util.PAY_TYPE_CREDIT,
        },
        json: true
    });
    if (!body.success) throw new Error(body.message);
    let gmoAuthorization = body.authorization;
    console.log("gmoAuthorization:", gmoAuthorization);


    // GMOオーソリ削除
    body = await request.post({
        url: `http://localhost:8080/transaction/${transaction._id}/removeAuthorization`,
        body: {
            transaction_password: "password",
            owner_id: ownerId4administrator,
            authorization_id: gmoAuthorization._id
        },
        json: true,
        simple: false,
    });
    if (!body.success) throw new Error(body.message);
    console.log("removeAuthorization result:", body);


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