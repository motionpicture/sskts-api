"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const request = require("request-promise-native");
const GMO = require("@motionpicture/gmo-service");
GMO.initialize({
    endpoint: "https://pt01.mul-pay.jp",
});
const COA = require("@motionpicture/coa-service");
COA.initialize({
    endpoint: "http://coacinema.aa0.netvolante.jp",
    refresh_token: "eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkX2F0IjoxNDc5MjYwODQ4LCJhdXRoX2lkIjoiMzMxNSJ9.jx-w7D3YLP7UbY4mzJYC9xr368FiKWcpR2_L9mZfehQ"
});
const moment = require("moment");
let count = 0;
setInterval(() => __awaiter(this, void 0, void 0, function* () {
    if (count > 10)
        return;
    count++;
    try {
        yield execute();
    }
    catch (error) {
        console.error(error.message);
    }
    count--;
}), 1000);
function execute() {
    return __awaiter(this, void 0, void 0, function* () {
        let response;
        let gmoShopId = "tshop00026096";
        let gmoShopPass = "xbxmkaa6";
        console.log("starting transaction...");
        response = yield request.post({
            url: "http://localhost:8080/transactions",
            body: {
                expired_at: moment().add(1, "minutes").unix(),
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        console.log("/transactions/start result:", response.statusCode, response.body);
        if (response.statusCode !== 201)
            throw new Error(response.body.message);
        let transactionId = response.body.data._id;
        let owners = response.body.data.attributes.owners;
        let promoterOwner = owners.find((owner) => {
            return (owner.group === "PROMOTER");
        });
        let promoterOwnerId = (promoterOwner) ? promoterOwner._id : null;
        let anonymousOwner = owners.find((owner) => {
            return (owner.group === "ANONYMOUS");
        });
        let anonymousOwnerId = (anonymousOwner) ? anonymousOwner._id : null;
        let theaterCode = "001";
        let dateJouei = "20170131";
        let titleCode = "8561";
        let titleBranchNum = "0";
        let timeBegin = "1210";
        let screenCode = "3";
        let salesTicketResult = yield COA.salesTicketInterface.call({
            theater_code: theaterCode,
            date_jouei: dateJouei,
            title_code: titleCode,
            title_branch_num: titleBranchNum,
            time_begin: timeBegin,
        });
        let getStateReserveSeatResult = yield COA.getStateReserveSeatInterface.call({
            theater_code: theaterCode,
            date_jouei: dateJouei,
            title_code: titleCode,
            title_branch_num: titleBranchNum,
            time_begin: timeBegin,
            screen_code: screenCode
        });
        let sectionCode = getStateReserveSeatResult.list_seat[0].seat_section;
        let freeSeatCodes = getStateReserveSeatResult.list_seat[0].list_free_seat.map((freeSeat) => {
            return freeSeat.seat_num;
        });
        console.log("freeSeatCodes count", freeSeatCodes.length);
        if (getStateReserveSeatResult.cnt_reserve_free === 0)
            throw new Error("no available seats.");
        let reserveSeatsTemporarilyResult = yield COA.reserveSeatsTemporarilyInterface.call({
            theater_code: theaterCode,
            date_jouei: dateJouei,
            title_code: titleCode,
            title_branch_num: titleBranchNum,
            time_begin: timeBegin,
            screen_code: screenCode,
            list_seat: [{
                    seat_section: sectionCode,
                    seat_num: freeSeatCodes[0]
                }, {
                    seat_section: sectionCode,
                    seat_num: freeSeatCodes[1]
                }]
        });
        console.log(reserveSeatsTemporarilyResult);
        console.log("adding authorizations coaSeatReservation...");
        let totalPrice = salesTicketResult.list_ticket[0].sale_price + salesTicketResult.list_ticket[0].sale_price;
        response = yield request.post({
            url: `http://localhost:8080/transactions/${transactionId}/authorizations/coaSeatReservation`,
            body: {
                owner_id_from: promoterOwnerId,
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
                    };
                }),
                price: totalPrice
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        console.log("addCOASeatReservationAuthorization result:", response.statusCode, response.body);
        if (response.statusCode !== 200)
            throw new Error(response.body.message);
        let orderId = Date.now().toString();
        let entryTranResult = yield GMO.CreditService.entryTranInterface.call({
            shop_id: gmoShopId,
            shop_pass: gmoShopPass,
            order_id: orderId,
            job_cd: GMO.Util.JOB_CD_AUTH,
            amount: totalPrice,
        });
        let execTranResult = yield GMO.CreditService.execTranInterface.call({
            access_id: entryTranResult.access_id,
            access_pass: entryTranResult.access_pass,
            order_id: orderId,
            method: "1",
            card_no: "4111111111111111",
            expire: "2012",
            security_code: "123",
        });
        console.log(execTranResult);
        console.log("adding authorizations gmo...");
        response = yield request.post({
            url: `http://localhost:8080/transactions/${transactionId}/authorizations/gmo`,
            body: {
                owner_id_from: anonymousOwnerId,
                owner_id_to: promoterOwnerId,
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
        if (response.statusCode !== 200)
            throw new Error(response.body.message);
    });
}
