/**
 * 取引開始
 */
// @Post("/create")
// create() {
//     let message: string = null;

//     return {
//         success: true,
//         message: message,
//         transaction_id: "12345",
//         transaction_password: "12345"
//     };
// }

/**
 * 購入番号発行
 * 
 * 購入者情報、決済方法関連情報、が必須
 * すでにGMOで与信確保済みであれば取り消してから新たに与信確保
 */
// @Post("/publishPaymentNo")
// publishPaymentNo(@BodyParam("transaction_id") transactionId: string, @BodyParam("transaction_password") transactionPassword: string) {
//     let message: string = null;
//     let moment: typeof momentModule = require("moment");
//     let paymentNo = `${moment().format("YYYYMMDD")}12345` // 購入番号

//     return {
//         success: true,
//         message: message,
//         paymentNo: paymentNo
//     };
// }

/**
 * 取引に対して署名を行う
 */
// @Post("/sign")
// sign() {
//     let message: string = null;

//     return {
//         success: true,
//         message: message
//     };
// }
