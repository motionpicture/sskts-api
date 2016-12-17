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
let TransactionController = class TransactionController extends BaseController_1.BaseController {
    /**
     * 取引開始
     */
    create() {
        let message = null;
        return {
            success: true,
            message: message,
            transaction_id: "12345",
            transaction_password: "12345"
        };
    }
    /**
     * 購入番号発行
     *
     * 購入者情報、決済方法関連情報、が必須
     * すでにGMOで与信確保済みであれば取り消してから新たに与信確保
     */
    publishPaymentNo(transactionId, transactionPassword) {
        let message = null;
        let moment = require("moment");
        let paymentNo = `${moment().format("YYYYMMDD")}12345`; // 購入番号
        return {
            success: true,
            message: message,
            paymentNo: paymentNo
        };
    }
    /**
     * 取引に対して署名を行う
     */
    sign() {
        let message = null;
        return {
            success: true,
            message: message
        };
    }
};
__decorate([
    routing_controllers_1.Post("/create"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "create", null);
__decorate([
    routing_controllers_1.Post("/publishPaymentNo"),
    __param(0, routing_controllers_1.BodyParam("transaction_id")), __param(1, routing_controllers_1.BodyParam("transaction_password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "publishPaymentNo", null);
__decorate([
    routing_controllers_1.Post("/sign"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "sign", null);
TransactionController = __decorate([
    routing_controllers_1.JsonController("/transaction"),
    __metadata("design:paramtypes", [])
], TransactionController);
exports.TransactionController = TransactionController;
