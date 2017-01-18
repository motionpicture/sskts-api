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
        let body;
        body = yield request.post({
            url: "http://localhost:8080/owner/anonymous/create",
            body: {
                group: "ANONYMOUS",
            },
            json: true,
            simple: false,
        });
        if (!body.success)
            throw new Error(body.message);
        let owner = body.owner;
        console.log("owner:", owner);
        let ownerId4administrator = "5868e16789cc75249cdbfa4b";
        body = yield request.post({
            url: "http://localhost:8080/transaction/start",
            body: {
                owners: [ownerId4administrator, owner._id]
            },
            json: true,
            simple: false,
        });
        if (!body.success)
            throw new Error(body.message);
        let transaction = body.transaction;
        console.log("transaction:", transaction);
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
        body = yield request.post({
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
                    };
                })
            },
            json: true,
            simple: false,
        });
        if (!body.success)
            throw new Error(body.message);
        console.log("addCOAAuthorization result:", body);
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
        body = yield request.post({
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
        if (!body.success)
            throw new Error(body.message);
        console.log("addGMOAuthorization result:", body);
        body = yield request.post({
            url: `http://localhost:8080/transaction/${transaction._id}/close`,
            body: {
                password: "password"
            },
            json: true,
            simple: false,
        });
        if (!body.success)
            throw new Error(body.message);
        console.log("close result:", body);
    });
}
main().then(() => {
    console.log("main processed.");
}).catch((err) => {
    console.error(err.message);
});
