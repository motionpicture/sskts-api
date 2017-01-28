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

import moment = require("moment");

/**
 * 進行中取引をつくりだす
 */
async function main() {
    let response: any;
    let gmoShopId = "tshop00026096";
    let gmoShopPass = "xbxmkaa6";

    // 運営者取得
    response = await request.get({
        url: "http://localhost:8080/owners/administrator",
        body: {
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
    });
    console.log("/owners/administrator result:", response.statusCode, response.body);
    if (response.statusCode !== 200) throw new Error(response.body.message);
    let administratorOwnerId = response.body.data._id;
    console.log("administratorOwnerId:", administratorOwnerId);

    // 一般所有者作成
    response = await request.post({
        url: "http://localhost:8080/owners/anonymous",
        body: {
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
    });
    console.log("/owners/anonymous result:", response.statusCode, response.body);
    if (response.statusCode !== 201) throw new Error(response.body.message);
    let anonymousOwnerId = response.body.data._id;
    console.log("anonymousOwnerId:", anonymousOwnerId);


    // 取引開始
    // 1分後に期限切れする
    // https://ja.wikipedia.org/wiki/UNIX%E6%99%82%E9%96%93
    response = await request.post({
        url: "http://localhost:8080/transactions",
        body: {
            expired_at: moment().add("minutes", 1).unix(),
            owners: [administratorOwnerId, anonymousOwnerId]
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
    });
    console.log("/transactions/start result:", response.statusCode, response.body);
    if (response.statusCode !== 201) throw new Error(response.body.message);
    let transactionId = response.body.data._id;








    // 販売可能チケット検索
    let salesTicketResult = await COA.salesTicketInterface.call({
        theater_code: "001",
        date_jouei: "20170131",
        title_code: "8513",
        title_branch_num: "0",
        time_begin: "1010",
    });
    console.log("salesTicketResult:", salesTicketResult);








    // COA空席確認
    let getStateReserveSeatResult = await COA.getStateReserveSeatInterface.call({
        theater_code: "001",
        date_jouei: "20170131",
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
        date_jouei: "20170131",
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
    let totalPrice = salesTicketResult.list_ticket[0].sale_price + salesTicketResult.list_ticket[0].sale_price;
    response = await request.post({
        url: `http://localhost:8080/transactions/${transactionId}/authorizations/coaSeatReservation`,
        body: {
            owner_id_from: administratorOwnerId,
            owner_id_to: anonymousOwnerId,
            coa_tmp_reserve_num: reserveSeatsTemporarilyResult.tmp_reserve_num,
            seats: reserveSeatsTemporarilyResult.list_tmp_reserve.map((tmpReserve) => {
                return {
                    performance: "001201701208513021010",
                    section: tmpReserve.seat_section,
                    seat_code: tmpReserve.seat_num,
                    ticket_code: salesTicketResult.list_ticket[0].ticket_code,
                    ticket_name_ja: salesTicketResult.list_ticket[0].ticket_name,
                    ticket_name_en: salesTicketResult.list_ticket[0].ticket_name_eng,
                    ticket_name_kana: salesTicketResult.list_ticket[0].ticket_name_kana,
                    std_price: salesTicketResult.list_ticket[0].std_price,
                    add_price: salesTicketResult.list_ticket[0].add_price,
                    dis_price: 0,
                    sale_price: salesTicketResult.list_ticket[0].sale_price,
                }
            }),
            price: totalPrice
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
    });
    console.log("addCOASeatReservationAuthorization result:", response.statusCode, response.body);
    if (response.statusCode !== 200) throw new Error(response.body.message);
    // let coaAuthorizationId = response.body.data._id;













    // GMOオーソリ取得
    let orderId = Date.now().toString();
    let entryTranResult = await GMO.CreditService.entryTranInterface.call({
        shop_id: gmoShopId,
        shop_pass: gmoShopPass,
        order_id: orderId,
        job_cd: GMO.Util.JOB_CD_AUTH,
        amount: totalPrice,
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
    response = await request.post({
        url: `http://localhost:8080/transactions/${transactionId}/authorizations/gmo`,
        body: {
            owner_id_from: anonymousOwnerId,
            owner_id_to: administratorOwnerId,
            gmo_shop_id: gmoShopId,
            gmo_shop_pass: gmoShopPass,
            gmo_order_id: orderId,
            gmo_amount: totalPrice,
            gmo_access_id: entryTranResult.access_id,
            gmo_access_pass: entryTranResult.access_pass,
            gmo_job_cd: GMO.Util.JOB_CD_AUTH,
            gmo_pay_type: GMO.Util.PAY_TYPE_CREDIT,
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
    });
    console.log("addGMOAuthorization result:", response.statusCode, response.body);
    if (response.statusCode !== 200) throw new Error(response.body.message);
    // let gmoAuthorizationId = response.body.data._id;
}

main().then(() => {
    console.log("main processed.");
}).catch((err) => {
    console.error(err.message);
});