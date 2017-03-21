"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ロガーミドルウェア
 *
 * @module
 */
const log4js = require("log4js");
const env = (process.env.NODE_ENV === undefined) ? 'development' : process.env.NODE_ENV;
log4js.configure({
    appenders: [
        {
            category: 'access',
            type: 'console'
        },
        {
            category: 'system',
            type: 'console'
        },
        {
            type: 'console'
        }
    ],
    levels: {
        access: (env === 'development') ? log4js.levels.ALL.toString() : log4js.levels.OFF.toString(),
        system: (env === 'production') ? log4js.levels.INFO.toString() : log4js.levels.ALL.toString()
    },
    replaceConsole: (env === 'production') ? false : true
});
exports.default = log4js.connectLogger(log4js.getLogger('access'), {});
