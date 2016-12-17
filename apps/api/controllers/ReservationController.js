"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
const BaseController_1 = require("./BaseController");
const routing_controllers_1 = require("routing-controllers");
let ReservationController = class ReservationController extends BaseController_1.BaseController {
    /**
     * 取引に割り当てる座席を追加する
     */
    createByTransactionId(transactionId, transactionPassword) {
        let message = null;
        return {
            success: true,
            message: message
        };
    }
    /**
     * 取引に割り当てる座席を削除する
     */
    removeByTransactionId(transactionId, transactionPassword) {
        let message = null;
        return {
            success: true,
            message: message
        };
    }
    /**
     * 取引に割り当てる座席に関わる情報(券種など)を更新する
     */
    updateByTransactionId(transactionId, transactionPassword) {
        let message = null;
        return {
            success: true,
            message: message
        };
    }
};
__decorate([
    routing_controllers_1.Post("/createByTransactionId"),
    __param(0, routing_controllers_1.BodyParam("transaction_id")), __param(1, routing_controllers_1.BodyParam("transaction_password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReservationController.prototype, "createByTransactionId", null);
__decorate([
    routing_controllers_1.Post("/removeByTransactionId"),
    __param(0, routing_controllers_1.BodyParam("transaction_id")), __param(1, routing_controllers_1.BodyParam("transaction_password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReservationController.prototype, "removeByTransactionId", null);
__decorate([
    routing_controllers_1.Post("/updateByTransactionId"),
    __param(0, routing_controllers_1.BodyParam("transaction_id")), __param(1, routing_controllers_1.BodyParam("transaction_password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReservationController.prototype, "updateByTransactionId", null);
ReservationController = __decorate([
    routing_controllers_1.JsonController("/reservation"),
    __metadata("design:paramtypes", [])
], ReservationController);
exports.ReservationController = ReservationController;
