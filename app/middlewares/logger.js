"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ロガーミドルウェア
 *
 * @module
 */
const log4js = require("log4js");
const env = process.env.NODE_ENV || 'development';
log4js.configure({
    appenders: [
        {
            category: 'access',
            type: 'console'
            // type: 'log4js-node-mongodb',
            // connectionString: config.get<string>('mongolab_uri_for_logs'),
        },
        {
            category: 'system',
            type: 'console'
            // type: 'log4js-node-mongodb',
            // connectionString: config.get<string>('mongolab_uri_for_logs'),
        },
        {
            type: 'console'
        }
    ],
    levels: {
        access: (env === 'development') ? log4js.levels.ALL.toString() : log4js.levels.OFF.toString(),
        system: (env === 'production') ? log4js.levels.INFO.toString() : log4js.levels.ALL.toString()
    },
    replaceConsole: (env === 'prod') ? false : true
});
exports.default = log4js.connectLogger(log4js.getLogger('access'), {});
