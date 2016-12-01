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
let BenchmarksMiddleware = class BenchmarksMiddleware {
    use(request, response, next) {
        if (process.env.NODE_ENV === 'dev') {
            let startMemory = process.memoryUsage();
            let startTime = process.hrtime();
            let log4js = require('log4js');
            let logger = log4js.getLogger('system');
            request.on('end', () => {
                let endMemory = process.memoryUsage();
                let memoryUsage = endMemory.rss - startMemory.rss;
                let diff = process.hrtime(startTime);
                logger.debug(`benchmark took ${diff[0]} seconds and ${diff[1]} nanoseconds. memoryUsage:${memoryUsage} (${startMemory.rss} - ${endMemory.rss})`);
            });
        }
        next();
    }
};
BenchmarksMiddleware = __decorate([
    routing_controllers_1.MiddlewareGlobalBefore(), 
    __metadata('design:paramtypes', [])
], BenchmarksMiddleware);
exports.BenchmarksMiddleware = BenchmarksMiddleware;
