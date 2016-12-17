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
const COAOAuthMiddleware_1 = require("../middlewares/COAOAuthMiddleware");
const requestModule = require("request");
let TheaterController = class TheaterController extends BaseController_1.BaseController {
    /**
     * 劇場詳細をコードから取得する
     */
    findByCode(id, request) {
        return new Promise((resolve, reject) => {
            requestModule.get({
                url: "http://coacinema.aa0.netvolante.jp/api/v1/theater/001/theater/",
                auth: {
                    'bearer': request["access_token"]
                }
            }, (error, response, body) => {
                if (error)
                    return reject(error);
                if (body.message)
                    return reject(new Error(body.message));
                resolve(body);
            });
        }).then((body) => {
            return {
                success: true,
                message: null,
                result: body
            };
        }, (err) => {
            return {
                success: false,
                message: err.message,
                result: null
            };
        });
    }
};
__decorate([
    routing_controllers_1.Get("/theater/:code"),
    routing_controllers_1.UseBefore(COAOAuthMiddleware_1.COAOAuthMiddleware),
    __param(0, routing_controllers_1.Param("code")), __param(1, routing_controllers_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TheaterController.prototype, "findByCode", null);
TheaterController = __decorate([
    routing_controllers_1.JsonController(),
    __metadata("design:paramtypes", [])
], TheaterController);
exports.TheaterController = TheaterController;
