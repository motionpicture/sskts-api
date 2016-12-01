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
const log4js = require('log4js');
const routing_controllers_1 = require("routing-controllers");
let env = process.env.NODE_ENV || 'dev';
// ディレクトリなければ作成(初回アクセス時だけ)
let logDir = `${__dirname}/../../../logs/${env}/api`;
// let fs = require('fs-extra');
// fs.mkdirsSync(logDir);
log4js.configure({
    appenders: [
        {
            category: 'access',
            type: 'dateFile',
            filename: `${logDir}/access.log`,
            pattern: '-yyyy-MM-dd',
        },
        {
            category: 'system',
            type: 'dateFile',
            filename: `${logDir}/system.log`,
            pattern: '-yyyy-MM-dd',
        },
        {
            type: 'console'
        }
    ],
    levels: {
        access: (env === 'dev') ? log4js.levels.ALL.toString() : log4js.levels.OFF.toString(),
        system: (env === 'prod') ? log4js.levels.INFO.toString() : log4js.levels.ALL.toString()
    },
    replaceConsole: (env === 'prod') ? false : true
});
let LoggerMiddleware = class LoggerMiddleware {
    use(request, response, next) {
        if (process.env.NODE_ENV === 'dev')
            return log4js.connectLogger(log4js.getLogger('access'), {})(request, response, next);
        next();
    }
};
LoggerMiddleware = __decorate([
    routing_controllers_1.MiddlewareGlobalBefore(), 
    __metadata('design:paramtypes', [])
], LoggerMiddleware);
exports.LoggerMiddleware = LoggerMiddleware;
