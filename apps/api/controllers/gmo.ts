import GMO = require("@motionpicture/gmo-service")

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
                method: "1", // 一括
                pay_times: 1, // 支払回数
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
            reject(err)
        });
    });
}
