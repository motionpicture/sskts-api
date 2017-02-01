"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class StockServiceInterpreter {
    unauthorizeAsset(authorization) {
        return (assetRepository) => __awaiter(this, void 0, void 0, function* () {
            console.log(authorization);
            console.log(assetRepository);
            throw new Error("not implemented.");
        });
    }
    transferAssset(authorization) {
        return (assetRepository) => __awaiter(this, void 0, void 0, function* () {
            console.log(authorization);
            console.log(assetRepository);
            throw new Error("not implemented.");
        });
    }
    unauthorizeCOASeatReservation(authorization) {
        return (coaRepository) => __awaiter(this, void 0, void 0, function* () {
            yield coaRepository.deleteTmpReserveInterface.call({
                theater_code: authorization.coa_theater_code,
                date_jouei: authorization.coa_date_jouei,
                title_code: authorization.coa_title_code,
                title_branch_num: authorization.coa_title_branch_num,
                time_begin: authorization.coa_time_begin,
                tmp_reserve_num: authorization.coa_tmp_reserve_num,
            });
        });
    }
    transferCOASeatReservation(authorization) {
        return (assetRepository) => __awaiter(this, void 0, void 0, function* () {
            let promises = authorization.assets.map((asset) => __awaiter(this, void 0, void 0, function* () {
                assetRepository.store(asset);
            }));
            yield Promise.all(promises);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new StockServiceInterpreter();
