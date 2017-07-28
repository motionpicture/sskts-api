"use strict";
/**
 * 注文照会サンプル
 *
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
const sskts = require("../lib/sskts-api");
const debug = createDebug('sskts-api:samples');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = new sskts.auth.OAuth2('motionpicture', 'motionpicture', 'teststate', ['admin']);
        // 劇場情報取得
        const order = yield sskts.service.order.findByOrderInquiryKey({
            auth: auth,
            orderInquiryKey: {
                telephone: '09012345678',
                orderNumber: 3045,
                theaterCode: '118'
            }
        });
        debug('order is', order);
    });
}
main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
