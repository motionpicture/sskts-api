"use strict";
/**
 * 劇場取得サンプル
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
const Scenarios = require("./scenarios");
const debug = createDebug('sskts-api:examples');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = new Scenarios.OAuth2(process.env.SSKTS_API_REFRESH_TOKEN, ['admin']);
        // 劇場情報取得
        const movieTheater = yield Scenarios.place.findMovieTheater({
            auth: auth,
            branchCode: '118'
        });
        debug('movieTheater is', movieTheater);
    });
}
main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
