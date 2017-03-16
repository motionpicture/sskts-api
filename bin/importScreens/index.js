"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 劇場インポート
 *
 * @ignore
 */
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const mongoose = require("mongoose");
const debug = createDebug('sskts-api:*');
// 複数劇場導入に対応のつもり todo 環境設定
const theaterCodes = [
    '118'
];
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        debug('connecting mongodb...');
        mongoose.connect(process.env.MONGOLAB_URI);
        const theaterRepo = sskts.adapter.theater(mongoose.connection);
        const screenRepo = sskts.adapter.screen(mongoose.connection);
        const promises = theaterCodes.map((theaterCode) => __awaiter(this, void 0, void 0, function* () {
            try {
                debug('importing screens...');
                yield sskts.service.master.importScreens(theaterCode)(theaterRepo, screenRepo);
                debug('screens imported.');
            }
            catch (error) {
                console.error(error);
            }
        }));
        yield Promise.all(promises);
        mongoose.disconnect();
    });
}
main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});