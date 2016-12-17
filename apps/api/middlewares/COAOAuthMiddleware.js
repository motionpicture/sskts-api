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
const routing_controllers_1 = require("routing-controllers");
const requestModule = require("request");
let COAOAuthMiddleware = class COAOAuthMiddleware {
    use(request, response, next) {
        requestModule.post({
            url: "http://CoaCinema.aa0.netvolante.jp/token/access_token",
            form: {
                refresh_token: "eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkX2F0IjoxNDc5MjYwODQ4LCJhdXRoX2lkIjoiMzMxNSJ9.jx-w7D3YLP7UbY4mzJYC9xr368FiKWcpR2_L9mZfehQ"
            },
            json: true
        }, (error, response, body) => {
            request.access_token = body.access_token;
            next();
        });
    }
};
COAOAuthMiddleware = __decorate([
    routing_controllers_1.MiddlewareGlobalBefore(),
    __metadata("design:paramtypes", [])
], COAOAuthMiddleware);
exports.COAOAuthMiddleware = COAOAuthMiddleware;
