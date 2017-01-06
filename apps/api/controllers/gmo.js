"use strict";
const request = require("request");
const querystring = require("querystring");
const GMO = require("../../common/utils/gmo");
function executeAuth(args) {
    return new Promise((resolve, reject) => {
        console.log("requesting...");
        request.post({
            url: "https://pt01.mul-pay.jp/payment/EntryTran.idPass",
            form: {
                ShopID: args.shop_id,
                ShopPass: args.shop_pass,
                OrderID: args.order_id,
                JobCd: GMO.STATUS_CREDIT_AUTH,
                Amount: args.amount.toString(),
            }
        }, (error, response, body) => {
            console.log("request processed.", error, body);
            if (error)
                return reject(error);
            if (response.statusCode !== 200)
                return reject(new Error(body));
            let entryTranResult = querystring.parse(body);
            if (entryTranResult["ErrCode"])
                return reject(new Error(body));
            console.log("requesting...");
            request.post({
                url: "https://pt01.mul-pay.jp/payment/ExecTran.idPass",
                form: {
                    AccessID: entryTranResult.AccessID,
                    AccessPass: entryTranResult.AccessPass,
                    ShopID: args.shop_id,
                    ShopPass: args.shop_pass,
                    OrderID: args.order_id,
                    Amount: args.amount.toString(),
                    Method: "1",
                    PayTimes: 1,
                    Token: args.token
                }
            }, (error, response, body) => {
                console.log("request processed.", error, body);
                if (error)
                    return reject(error);
                if (response.statusCode !== 200)
                    return reject(new Error(body));
                let execTranResult = querystring.parse(body);
                if (execTranResult["ErrCode"])
                    return reject(new Error(body));
                resolve();
            });
        });
    });
}
exports.executeAuth = executeAuth;
function executeSales(args) {
    return new Promise((resolve, reject) => {
        console.log("requesting...");
        request.post({
            url: "https://pt01.mul-pay.jp/payment/AlterTran.idPass",
            form: {
                ShopID: args.shop_id,
                ShopPass: args.shop_pass,
                AccessID: args.access_id,
                AccessPass: args.access_pass,
                JobCd: GMO.STATUS_CREDIT_SALES,
                Amount: args.amount.toString(),
            }
        }, (error, response, body) => {
            console.log("request processed.", error, body);
            if (error)
                return reject(error);
            if (response.statusCode !== 200)
                return reject(new Error(body));
            let execTranResult = querystring.parse(body);
            if (execTranResult["ErrCode"])
                return reject(new Error(body));
            resolve();
        });
    });
}
exports.executeSales = executeSales;
