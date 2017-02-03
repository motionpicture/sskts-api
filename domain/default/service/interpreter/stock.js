"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const objectId_1 = require("../../model/objectId");
const transactionStatus_1 = require("../../model/transactionStatus");
class StockServiceInterpreter {
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
                yield assetRepository.store(asset);
            }));
            yield Promise.all(promises);
        });
    }
    disableTransactionInquiry(args) {
        return (transactionRepository, coaRepository) => __awaiter(this, void 0, void 0, function* () {
            let option = yield transactionRepository.findById(objectId_1.default(args.transaction_id));
            if (option.isEmpty)
                throw new Error("transaction not found.");
            let tranasction = option.get();
            let reservation = yield coaRepository.stateReserveInterface.call({
                theater_code: tranasction.inquiry_theater,
                reserve_num: parseInt(tranasction.inquiry_id),
                tel_num: tranasction.inquiry_pass,
            });
            yield coaRepository.deleteReserveInterface.call({
                theater_code: tranasction.inquiry_theater,
                reserve_num: parseInt(tranasction.inquiry_id),
                tel_num: tranasction.inquiry_pass,
                date_jouei: reservation.date_jouei,
                title_code: reservation.title_code,
                title_branch_num: reservation.title_branch_num,
                time_begin: reservation.time_begin,
                list_seat: reservation.list_ticket
            });
            yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(args.transaction_id),
                status: transactionStatus_1.default.UNDERWAY
            }, {
                $set: {
                    inquiry_theater: "",
                    inquiry_id: "",
                    inquiry_pass: "",
                },
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new StockServiceInterpreter();
