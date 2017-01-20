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
    let response: any;

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
        }, {
            seat_section: sectionCode,
            seat_num: freeSeatCodes[1]
        }]
    })
    console.log(reserveSeatsTemporarilyResult);

    // COAオーソリ追加
    response = await request.put({
        url: `http://localhost:8080/transaction/${transaction._id}/addCOASeatReservationAuthorization`,
        body: {
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
        resolveWithFullResponse: true,
    });
    if (response.statusCode !== 204) throw new Error(response.body.message);
    console.log("addCOASeatReservationAuthorization result:", response.statusCode, response.body);





    // COA仮予約削除
    await COA.deleteTmpReserveInterface.call({
        theater_code: "001",
        date_jouei: "20170120",
        title_code: "8513",
        title_branch_num: "0",
        time_begin: "1010",
        // screen_code: "2",
        tmp_reserve_num: reserveSeatsTemporarilyResult.tmp_reserve_num.toString()
    })
    console.log("deleteTmpReserveResult:", true);

    // COAオーソリ削除
    response = await request.put({
        url: `http://localhost:8080/transaction/${transaction._id}/removeCOASeatReservationAuthorization`,
        body: {
            coa_tmp_reserve_num: reserveSeatsTemporarilyResult.tmp_reserve_num.toString()
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
    });
    if (response.statusCode !== 204) throw new Error(response.body.message);
    console.log("removeCOASeatReservationAuthorization result:", response.statusCode, response.body);





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
    response = await request.put({
        url: `http://localhost:8080/transaction/${transaction._id}/addGMOAuthorization`,
        body: {
            owner_id: owner._id,
            gmo_shop_id: "tshop00024015",
            gmo_shop_pass: "hf3wsuyy",
            gmo_order_id: orderId,
            gmo_amount: amount,
            gmo_access_id: entryTranResult.access_id,
            gmo_access_pass: entryTranResult.access_pass,
            gmo_job_cd: GMO.Util.JOB_CD_SALES,
            gmo_pay_type: GMO.Util.PAY_TYPE_CREDIT,
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
    });
    if (response.statusCode !== 204) throw new Error(response.body.message);
    console.log("addGMOAuthorization result:", response.statusCode, response.body);



    // GMOオーソリ取消
    let alterTranResult = await GMO.CreditService.alterTranInterface.call({
        shop_id: "tshop00024015",
        shop_pass: "hf3wsuyy",
        access_id: entryTranResult.access_id,
        access_pass: entryTranResult.access_pass,
        job_cd: GMO.Util.JOB_CD_VOID
    });
    console.log("alterTranResult:", alterTranResult);

    // GMOオーソリ削除
    response = await request.put({
        url: `http://localhost:8080/transaction/${transaction._id}/removeGMOAuthorization`,
        body: {
            gmo_order_id: orderId
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
    });
    if (response.statusCode !== 204) throw new Error(response.body.message);
    console.log("removeGMOAuthorization result:", response.statusCode, response.body);











    // COA仮予約2回目
    let reserveSeatsTemporarilyResult2 = await COA.reserveSeatsTemporarilyInterface.call({
        theater_code: "001",
        date_jouei: "20170120",
        title_code: "8513",
        title_branch_num: "0",
        time_begin: "1010",
        screen_code: "2",
        list_seat: [{
            seat_section: sectionCode,
            seat_num: freeSeatCodes[0]
        }, {
            seat_section: sectionCode,
            seat_num: freeSeatCodes[1]
        }]
    })
    console.log("reserveSeatsTemporarilyResult2:", reserveSeatsTemporarilyResult2);

    // COAオーソリ追加
    response = await request.put({
        url: `http://localhost:8080/transaction/${transaction._id}/addCOASeatReservationAuthorization`,
        body: {
            owner_id: ownerId4administrator,
            coa_tmp_reserve_num: reserveSeatsTemporarilyResult2.tmp_reserve_num,
            seats: reserveSeatsTemporarilyResult2.list_tmp_reserve.map((tmpReserve) => {
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
        resolveWithFullResponse: true,
    });
    if (response.statusCode !== 204) throw new Error(response.body.message);
    console.log("addCOASeatReservationAuthorization result:", response.statusCode, response.body);








    // GMOオーソリ取得(2回目)
    orderId = Date.now().toString();
    amount = 1500;
    let entryTranResult2 = await GMO.CreditService.entryTranInterface.call({
        shop_id: "tshop00024015",
        shop_pass: "hf3wsuyy",
        order_id: orderId,
        job_cd: GMO.Util.JOB_CD_AUTH,
        amount: amount,
    });

    let execTranResult2 = await GMO.CreditService.execTranInterface.call({
        access_id: entryTranResult2.access_id,
        access_pass: entryTranResult2.access_pass,
        order_id: orderId,
        method: "1",
        card_no: "4111111111111111",
        expire: "2012",
        security_code: "123",
    });
    console.log("execTranResult2:", execTranResult2);

    // GMOオーソリ追加
    response = await request.put({
        url: `http://localhost:8080/transaction/${transaction._id}/addGMOAuthorization`,
        body: {
            owner_id: owner._id,
            gmo_shop_id: "tshop00024015",
            gmo_shop_pass: "hf3wsuyy",
            gmo_order_id: orderId,
            gmo_amount: amount,
            gmo_access_id: entryTranResult2.access_id,
            gmo_access_pass: entryTranResult2.access_pass,
            gmo_job_cd: GMO.Util.JOB_CD_SALES,
            gmo_pay_type: GMO.Util.PAY_TYPE_CREDIT,
        },
        json: true,
        resolveWithFullResponse: true,
    });
    if (response.statusCode !== 204) throw new Error(response.body.message);
    console.log("addGMOAuthorization result:", response.statusCode, response.body);






    // 販売可能チケット検索
    let salesTicketResult = await COA.salesTicketInterface.call({
        theater_code: "001",
        date_jouei: "20170120",
        title_code: "8513",
        title_branch_num: "0",
        time_begin: "1010",
    });
    console.log("salesTicketResult:", salesTicketResult);

    // COA本予約
    let tel = "09012345678";
    let updateReserveResult = await COA.updateReserveInterface.call({
        theater_code: "001",
        date_jouei: "20170120",
        title_code: "8513",
        title_branch_num: "0",
        time_begin: "1010",
        // screen_code: "2",
        tmp_reserve_num: reserveSeatsTemporarilyResult2.tmp_reserve_num.toString(),
        reserve_name: "山崎 哲",
        reserve_name_jkana: "ヤマザキ テツ",
        tel_num: "09012345678",
        mail_addr: "yamazaki@motionpicture.jp",
        reserve_amount: 1800, // 適当な金額
        list_ticket: reserveSeatsTemporarilyResult2.list_tmp_reserve.map((tmpReserve) => {
            return {
                ticket_code: salesTicketResult.list_ticket[0].ticket_code,
                std_price: salesTicketResult.list_ticket[0].std_price,
                add_price: salesTicketResult.list_ticket[0].add_price,
                dis_price: 0,
                sale_price: salesTicketResult.list_ticket[0].sale_price,
                ticket_count: 1,
                seat_num: tmpReserve.seat_num
            }
        })
    });
    console.log("updateReserveResult:", updateReserveResult);






    // 照会情報登録(購入番号と電話番号で照会する場合)
    response = await request.put({
        url: `http://localhost:8080/transaction/${transaction._id}/enableInquiry`,
        body: {
            inquiry_id: updateReserveResult.reserve_num,
            inquiry_pass: tel
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
    });
    if (response.statusCode !== 204) throw new Error(response.body.message);
    console.log("enableInquiry result:", response.statusCode, response.body);





    // 取引成立
    response = await request.put({
        url: `http://localhost:8080/transaction/${transaction._id}/close`,
        body: {
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
    });
    if (response.statusCode !== 204) throw new Error(response.body.message);
    console.log("close result:", response.statusCode, response.body);
}


// options = {
//     url: "http://localhost:8080/transaction/586d8cc2fe0c971cd4b714f2/unauthorize",
//     body: {
//         authorizations: ["586d9190ffe1bd0f9c2281cb", "586d9190ffe1bd0f9c2281cc"],
//     },
//     json: true
// };

// options = {
//     url: "http://localhost:8080/transaction/586ee23af94ed12254c284fd/update",
//     body: {
//         expired_at: moment().add(+30, 'minutes').unix()
//     },
//     json: true
// };

main().then(() => {
    console.log("main processed.");
}).catch((err) => {
    console.error(err.message);
});