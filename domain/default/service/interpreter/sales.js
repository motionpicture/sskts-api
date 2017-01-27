"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const GMO = require("@motionpicture/gmo-service");
class SalesServiceInterpreter {
    cancelGMOAuth(authorization) {
        return (gmoRepository) => __awaiter(this, void 0, void 0, function* () {
            console.log(gmoRepository);
            console.log(authorization);
        });
    }
    ;
    settleGMOAuth(authorization) {
        return (gmoRepository) => __awaiter(this, void 0, void 0, function* () {
            yield gmoRepository.CreditService.alterTranInterface.call({
                shop_id: authorization.gmo_shop_id,
                shop_pass: authorization.gmo_shop_pass,
                access_id: authorization.gmo_access_id,
                access_pass: authorization.gmo_access_pass,
                job_cd: GMO.Util.JOB_CD_SALES,
                amount: authorization.gmo_amount,
            });
        });
    }
    ;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new SalesServiceInterpreter();
