"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const AssetFactory = require("../../factory/asset");
class StockServiceInterpreter {
    unauthorizeAsset(authorization) {
        return (assetRepository) => __awaiter(this, void 0, void 0, function* () {
            console.log(authorization);
            console.log(assetRepository);
        });
    }
    transferAssset(authorization) {
        return (assetRepository) => __awaiter(this, void 0, void 0, function* () {
            console.log(authorization);
            console.log(assetRepository);
        });
    }
    unauthorizeCOASeatReservation(authorization) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(authorization);
        });
    }
    transferCOASeatReservation(authorization) {
        return (assetRepository) => __awaiter(this, void 0, void 0, function* () {
            let promises = authorization.seats.map((seat) => __awaiter(this, void 0, void 0, function* () {
                let asset = AssetFactory.createSeatReservation({
                    price: authorization.price,
                    authorizations: [],
                    performance: seat.performance,
                    section: seat.section,
                    seat_code: seat.seat_code,
                });
                assetRepository.store(asset);
            }));
            yield Promise.all(promises);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new StockServiceInterpreter();
