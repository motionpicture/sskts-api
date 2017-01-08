"use strict";
const GMO = require("@motionpicture/gmo-service");
function executeAuth(args) {
    return new Promise((resolve, reject) => {
        GMO.CreditService.entryTranInterface.call({
            shop_id: args.shop_id,
            shop_pass: args.shop_pass,
            order_id: args.order_id,
            job_cd: GMO.Util.JOB_CD_AUTH,
            amount: args.amount,
        }).then((entryTranResult) => {
            GMO.CreditService.execTranInterface.call({
                access_id: entryTranResult.access_id,
                access_pass: entryTranResult.access_pass,
                order_id: args.order_id,
                method: "1",
                pay_times: 1,
                token: args.token
            }).then(() => {
                resolve();
            }, (err) => {
                reject(err);
            });
        }, (err) => {
            reject(err);
        });
    });
}
exports.executeAuth = executeAuth;
function executeSales(args) {
    return new Promise((resolve, reject) => {
        GMO.CreditService.alterTranInterface.call({
            shop_id: args.shop_id,
            shop_pass: args.shop_pass,
            access_id: args.access_id,
            access_pass: args.access_pass,
            job_cd: GMO.Util.JOB_CD_SALES,
            amount: args.amount
        }).then(() => {
            resolve();
        }, (err) => {
            reject(err);
        });
    });
}
exports.executeSales = executeSales;
