import request = require("request");
import querystring = require("querystring");
import * as GMO from "../../common/utils/gmo"

/**
 * GMO仮売上
 */
export function executeAuth(args: {
    shop_id: string,
    shop_pass: string,
    order_id: string,
    amount: number,
    token: string,
}) {

    return new Promise((resolve: () => void, reject: (err: Error) => void) => {
        // 取引登録
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
            if (error) return reject(error);
            if (response.statusCode !== 200) return reject(new Error(body));

            let entryTranResult = querystring.parse(body);
            if (entryTranResult["ErrCode"]) return reject(new Error(body));

            // 決済実行
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
                    Method: "1", // 一括
                    PayTimes: 1, // 支払回数
                    Token: args.token
                }
            }, (error, response, body) => {
                console.log("request processed.", error, body);
                if (error) return reject(error);
                if (response.statusCode !== 200) return reject(new Error(body));

                let execTranResult = querystring.parse(body);
                if (execTranResult["ErrCode"]) return reject(new Error(body));

                resolve();
            });
        });
    });
}

/**
 * GMO実売上
 */
export function executeSales(args: {
    shop_id: string,
    shop_pass: string,
    access_id: string,
    access_pass: string,
    amount: number,
}) {
    return new Promise((resolve: () => void, reject: (err: Error) => void) => {
        // 決済実行
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
            if (error) return reject(error);
            if (response.statusCode !== 200) return reject(new Error(body));

            let execTranResult = querystring.parse(body);
            if (execTranResult["ErrCode"]) return reject(new Error(body));

            resolve();
        });
    });
}
