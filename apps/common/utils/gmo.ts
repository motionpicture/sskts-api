/** カード */
export var PAY_TYPE_CREDIT = '0';
/** モバイルSuica */
export var PAY_TYPE_SUICA = '1';
/** 楽天Edy */
export var PAY_TYPE_EDY = '2';
/** コンビニ */
export var PAY_TYPE_CVS = '3';
/** 現金(GMOではありえないが、決済方法をここにまとめるために作成) */
export var PAY_TYPE_CASH = 'Z';
// 4：Pay-easy
// 5：PayPal
// 6：iD
// 7：WebMoney
// 8：au かんたん
// 9：docomo
// B：ソフトバンクまとめて支払い(Ｂ)
// C：じぶん銀行
// E：JCB プリカ
// G：NET CASH・nanaco ギフト
// I：楽天ID
// J：多通貨クレジットカード
// K：LINE Pay 決済
// L：ネット銀聯決済
// N：銀行振込(バーチャル口座)
// O：リクルートかんたん支払い決済




/** 未決済 */
export var STATUS_CVS_UNPROCESSED = 'UNPROCESSED';
/** 要求成功 */
export var STATUS_CVS_REQSUCCESS = 'REQSUCCESS';
/** 決済完了 */
export var STATUS_CVS_PAYSUCCESS = 'PAYSUCCESS';
/** 決済失敗 */
export var STATUS_CVS_PAYFAIL = 'PAYFAIL';
/** 期限切れ */
export var STATUS_CVS_EXPIRED = 'EXPIRED';
/** 支払い停止 */
export var STATUS_CVS_CANCEL = 'CANCEL';

/** 未決済 */
export var STATUS_CREDIT_UNPROCESSED = 'UNPROCESSED';
/** 未決済(3D 登録済) */
export var STATUS_CREDIT_AUTHENTICATED = 'AUTHENTICATED';
/** 有効性チェック */
export var STATUS_CREDIT_CHECK = 'CHECK';
/** 即時売上 */
export var STATUS_CREDIT_CAPTURE = 'CAPTURE';
/** 仮売上 */
export var STATUS_CREDIT_AUTH = 'AUTH';
/** 実売上 */
export var STATUS_CREDIT_SALES = 'SALES';
/** 取消 */
export var STATUS_CREDIT_VOID = 'VOID';
/** 返品 */
export var STATUS_CREDIT_RETURN = 'RETURN';
/** 月跨り返品 */
export var STATUS_CREDIT_RETURNX = 'RETURNX';
/** 簡易オーソリ */
export var STATUS_CREDIT_SAUTH = 'SAUTH';

/**
 * ショップ情報確認文字列を作成する
 */
export function createShopPassString(shopId: string, orderId: string, amount: string, shopPassword: string, dateTime: string) {
    // 「ショップ ID + オーダーID + 利用金額＋税送料＋ショップパスワード + 日時情報」を MD5 でハッシュした文字列。
    let crypto = require('crypto');
    let md5hash = crypto.createHash('md5');
    md5hash.update(`${shopId}${orderId}${amount}${shopPassword}${dateTime}`, 'utf8');
    return md5hash.digest('hex');
}