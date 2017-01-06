"use strict";
exports.PAY_TYPE_CREDIT = '0';
exports.PAY_TYPE_SUICA = '1';
exports.PAY_TYPE_EDY = '2';
exports.PAY_TYPE_CVS = '3';
exports.PAY_TYPE_CASH = 'Z';
exports.STATUS_CVS_UNPROCESSED = 'UNPROCESSED';
exports.STATUS_CVS_REQSUCCESS = 'REQSUCCESS';
exports.STATUS_CVS_PAYSUCCESS = 'PAYSUCCESS';
exports.STATUS_CVS_PAYFAIL = 'PAYFAIL';
exports.STATUS_CVS_EXPIRED = 'EXPIRED';
exports.STATUS_CVS_CANCEL = 'CANCEL';
exports.STATUS_CREDIT_UNPROCESSED = 'UNPROCESSED';
exports.STATUS_CREDIT_AUTHENTICATED = 'AUTHENTICATED';
exports.STATUS_CREDIT_CHECK = 'CHECK';
exports.STATUS_CREDIT_CAPTURE = 'CAPTURE';
exports.STATUS_CREDIT_AUTH = 'AUTH';
exports.STATUS_CREDIT_SALES = 'SALES';
exports.STATUS_CREDIT_VOID = 'VOID';
exports.STATUS_CREDIT_RETURN = 'RETURN';
exports.STATUS_CREDIT_RETURNX = 'RETURNX';
exports.STATUS_CREDIT_SAUTH = 'SAUTH';
function createShopPassString(shopId, orderId, amount, shopPassword, dateTime) {
    let crypto = require('crypto');
    let md5hash = crypto.createHash('md5');
    md5hash.update(`${shopId}${orderId}${amount}${shopPassword}${dateTime}`, 'utf8');
    return md5hash.digest('hex');
}
exports.createShopPassString = createShopPassString;
