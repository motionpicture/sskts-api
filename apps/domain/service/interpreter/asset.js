"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var interpreter;
(function (interpreter) {
    function authorize(authorization) {
        return (assetRepository) => __awaiter(this, void 0, void 0, function* () {
            console.log(authorization);
            console.log(assetRepository);
        });
    }
    interpreter.authorize = authorize;
    function unauthorize(authorization) {
        return (assetRepository) => __awaiter(this, void 0, void 0, function* () {
            console.log(authorization);
            console.log(assetRepository);
        });
    }
    interpreter.unauthorize = unauthorize;
    function transfer(authorization) {
        return (assetRepository) => __awaiter(this, void 0, void 0, function* () {
            console.log(authorization);
            console.log(assetRepository);
        });
    }
    interpreter.transfer = transfer;
    function unauthorizeGMO(authorization) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(authorization);
        });
    }
    interpreter.unauthorizeGMO = unauthorizeGMO;
    function transferGMO(authorization) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(authorization);
        });
    }
    interpreter.transferGMO = transferGMO;
    function unauthorizeCOASeatReservation(authorization) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(authorization);
        });
    }
    interpreter.unauthorizeCOASeatReservation = unauthorizeCOASeatReservation;
    function transferCOASeatReservation(authorization) {
        return (assetRepository) => __awaiter(this, void 0, void 0, function* () {
            console.log(authorization);
            console.log(assetRepository);
        });
    }
    interpreter.transferCOASeatReservation = transferCOASeatReservation;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
