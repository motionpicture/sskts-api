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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let response;
        response = yield request.post({
            url: "http://localhost:8080/owners/anonymous",
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        console.log("/owners/anonymous result:", response.statusCode, response.body);
        if (response.statusCode !== 201)
            throw new Error(response.body.message);
        let anonymousOwnerId = response.body.data._id;
        console.log("anonymousOwnerId:", anonymousOwnerId);
        let anonymousOwnerId4administrator = "5868e16789cc75249cdbfa4b";
        response = yield request.post({
            url: "http://localhost:8080/transactions",
            body: {
                owners: [anonymousOwnerId4administrator, anonymousOwnerId]
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        console.log("/transactions/start result:", response.statusCode, response.body);
        if (response.statusCode !== 201)
            throw new Error(response.body.message);
        let transactionId = response.body.data._id;
        let getStateReserveSeatResult = yield COA.getStateReserveSeatInterface.call({
            theater_code: "001",
            date_jouei: "20170120",
            title_code: "8513",
            title_branch_num: "0",
            time_begin: "1010",
            screen_code: "2"
        });
        let sectionCode = getStateReserveSeatResult.list_seat[0].seat_section;
        let freeSeatCodes = getStateReserveSeatResult.list_seat[0].list_free_seat.map((freeSeat) => {
            return freeSeat.seat_num;
        });
        console.log(freeSeatCodes);
        let reserveSeatsTemporarilyResult = yield COA.reserveSeatsTemporarilyInterface.call({
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
        });
        console.log(reserveSeatsTemporarilyResult);
        response = yield request.post({
            url: `http://localhost:8080/transactions/${transactionId}/authorizations/coaSeatReservation`,
            body: {
                owner_id: anonymousOwnerId4administrator,
                coa_tmp_reserve_num: reserveSeatsTemporarilyResult.tmp_reserve_num,
                seats: reserveSeatsTemporarilyResult.list_tmp_reserve.map((tmpReserve) => {
                    return {
                        performance: "001201701208513021010",
                        section: tmpReserve.seat_section,
                        seat_code: tmpReserve.seat_num,
                        ticket_code: "",
                    };
                })
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        console.log("addCOASeatReservationAuthorization result:", response.statusCode, response.body);
        if (response.statusCode !== 204)
            throw new Error(response.body.message);
        yield COA.deleteTmpReserveInterface.call({
            theater_code: "001",
            date_jouei: "20170120",
            title_code: "8513",
            title_branch_num: "0",
            time_begin: "1010",
            tmp_reserve_num: reserveSeatsTemporarilyResult.tmp_reserve_num.toString()
        });
        console.log("deleteTmpReserveResult:", true);
        response = yield request.del({
            url: `http://localhost:8080/transactions/${transactionId}/authorizations/coaSeatReservation`,
            body: {
                coa_tmp_reserve_num: reserveSeatsTemporarilyResult.tmp_reserve_num.toString()
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        console.log("removeCOASeatReservationAuthorization result:", response.statusCode, response.body);
        if (response.statusCode !== 204)
            throw new Error(response.body.message);
        let orderId = Date.now().toString();
        let amount = 1800;
        let entryTranResult = yield GMO.CreditService.entryTranInterface.call({
            shop_id: "tshop00024015",
            shop_pass: "hf3wsuyy",
            order_id: orderId,
            job_cd: GMO.Util.JOB_CD_AUTH,
            amount: amount,
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
        response = yield request.post({
            url: `http://localhost:8080/transactions/${transactionId}/authorizations/gmo`,
            body: {
                owner_id: anonymousOwnerId,
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
        console.log("addGMOAuthorization result:", response.statusCode, response.body);
        if (response.statusCode !== 204)
            throw new Error(response.body.message);
        let alterTranResult = yield GMO.CreditService.alterTranInterface.call({
            shop_id: "tshop00024015",
            shop_pass: "hf3wsuyy",
            access_id: entryTranResult.access_id,
            access_pass: entryTranResult.access_pass,
            job_cd: GMO.Util.JOB_CD_VOID
        });
        console.log("alterTranResult:", alterTranResult);
        response = yield request.del({
            url: `http://localhost:8080/transactions/${transactionId}/authorizations/gmo`,
            body: {
                gmo_order_id: orderId
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        console.log("removeGMOAuthorization result:", response.statusCode, response.body);
        if (response.statusCode !== 204)
            throw new Error(response.body.message);
        let reserveSeatsTemporarilyResult2 = yield COA.reserveSeatsTemporarilyInterface.call({
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
        });
        console.log("reserveSeatsTemporarilyResult2:", reserveSeatsTemporarilyResult2);
        response = yield request.post({
            url: `http://localhost:8080/transactions/${transactionId}/authorizations/coaSeatReservation`,
            body: {
                owner_id: anonymousOwnerId4administrator,
                coa_tmp_reserve_num: reserveSeatsTemporarilyResult2.tmp_reserve_num,
                seats: reserveSeatsTemporarilyResult2.list_tmp_reserve.map((tmpReserve) => {
                    return {
                        performance: "001201701208513021010",
                        section: tmpReserve.seat_section,
                        seat_code: tmpReserve.seat_num,
                        ticket_code: "",
                    };
                })
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        console.log("addCOASeatReservationAuthorization result:", response.statusCode, response.body);
        if (response.statusCode !== 204)
            throw new Error(response.body.message);
        orderId = Date.now().toString();
        amount = 1500;
        let entryTranResult2 = yield GMO.CreditService.entryTranInterface.call({
            shop_id: "tshop00024015",
            shop_pass: "hf3wsuyy",
            order_id: orderId,
            job_cd: GMO.Util.JOB_CD_AUTH,
            amount: amount,
        });
        let execTranResult2 = yield GMO.CreditService.execTranInterface.call({
            access_id: entryTranResult2.access_id,
            access_pass: entryTranResult2.access_pass,
            order_id: orderId,
            method: "1",
            card_no: "4111111111111111",
            expire: "2012",
            security_code: "123",
        });
        console.log("execTranResult2:", execTranResult2);
        response = yield request.post({
            url: `http://localhost:8080/transactions/${transactionId}/authorizations/gmo`,
            body: {
                owner_id: anonymousOwnerId,
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
        console.log("addGMOAuthorization result:", response.statusCode, response.body);
        if (response.statusCode !== 204)
            throw new Error(response.body.message);
        response = yield request.patch({
            url: `http://localhost:8080/owners/anonymous/${anonymousOwnerId}`,
            body: {
                name_first: "Tetsu",
                name_last: "Yamazaki",
                tel: "09012345678",
                email: "yamazaki@motionpicture.jp",
            },
            json: true,
            resolveWithFullResponse: true,
        });
        console.log("/owners/anonymous/${anonymousOwnerId} result:", response.statusCode, response.body);
        if (response.statusCode !== 204)
            throw new Error(response.body.message);
        let salesTicketResult = yield COA.salesTicketInterface.call({
            theater_code: "001",
            date_jouei: "20170120",
            title_code: "8513",
            title_branch_num: "0",
            time_begin: "1010",
        });
        console.log("salesTicketResult:", salesTicketResult);
        let tel = "09012345678";
        let updateReserveResult = yield COA.updateReserveInterface.call({
            theater_code: "001",
            date_jouei: "20170120",
            title_code: "8513",
            title_branch_num: "0",
            time_begin: "1010",
            tmp_reserve_num: reserveSeatsTemporarilyResult2.tmp_reserve_num.toString(),
            reserve_name: "山崎 哲",
            reserve_name_jkana: "ヤマザキ テツ",
            tel_num: "09012345678",
            mail_addr: "yamazaki@motionpicture.jp",
            reserve_amount: 1800,
            list_ticket: reserveSeatsTemporarilyResult2.list_tmp_reserve.map((tmpReserve) => {
                return {
                    ticket_code: salesTicketResult.list_ticket[0].ticket_code,
                    std_price: salesTicketResult.list_ticket[0].std_price,
                    add_price: salesTicketResult.list_ticket[0].add_price,
                    dis_price: 0,
                    sale_price: salesTicketResult.list_ticket[0].sale_price,
                    ticket_count: 1,
                    seat_num: tmpReserve.seat_num
                };
            })
        });
        console.log("updateReserveResult:", updateReserveResult);
        response = yield request.patch({
            url: `http://localhost:8080/transactions/${transactionId}/enableInquiry`,
            body: {
                inquiry_id: updateReserveResult.reserve_num,
                inquiry_pass: tel
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        console.log("enableInquiry result:", response.statusCode, response.body);
        if (response.statusCode !== 204)
            throw new Error(response.body.message);
        response = yield request.patch({
            url: `http://localhost:8080/transactions/${transactionId}/close`,
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        console.log("close result:", response.statusCode, response.body);
        if (response.statusCode !== 204)
            throw new Error(response.body.message);
    });
}
main().then(() => {
    console.log("main processed.");
}).catch((err) => {
    console.error(err.message);
});
