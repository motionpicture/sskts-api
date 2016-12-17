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
let PerformanceController = class PerformanceController extends BaseController_1.BaseController {
    /**
     * パフォーマンス検索
     */
    find() {
        let results = [];
        return {
            success: true,
            results: results
        };
    }
    /**
     * パフォーマンスをIDから取得
     */
    findById(id) {
        return {
            success: true,
            result: {
                _id: id,
                film_name: "film_name"
            }
        };
    }
    /**
     * 座席状態取得
     */
    getSeatStatuses(id) {
        return {
            success: true
        };
    }
};
__decorate([
    routing_controllers_1.Get("/performances"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "find", null);
__decorate([
    routing_controllers_1.Get("/performance/:id"),
    __param(0, routing_controllers_1.Param("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "findById", null);
__decorate([
    routing_controllers_1.Get("/performance/:id/seatStatuses"),
    __param(0, routing_controllers_1.Param("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getSeatStatuses", null);
PerformanceController = __decorate([
    routing_controllers_1.JsonController(),
    __metadata("design:paramtypes", [])
], PerformanceController);
exports.PerformanceController = PerformanceController;
