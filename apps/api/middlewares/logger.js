"use strict";
const log4js = require("log4js");
const config = require("config");
let env = process.env.NODE_ENV || "dev";
// ディレクトリなければ作成(初回アクセス時だけ)
let logDir = `${__dirname}/../../../logs/${env}/api`;
let fs = require("fs-extra");
fs.mkdirsSync(logDir);
log4js.configure({
    appenders: [
        {
            category: "access",
            type: "dateFile",
            filename: `${logDir}/access.log`,
            pattern: "-yyyy-MM-dd",
        },
        {
            category: "system",
            type: "dateFile",
            filename: `${logDir}/system.log`,
            pattern: "-yyyy-MM-dd",
        },
        {
            type: "console"
        }
    ],
    levels: {
        access: (env === "dev") ? log4js.levels.ALL.toString() : log4js.levels.OFF.toString(),
        system: (env === "prod") ? log4js.levels.INFO.toString() : log4js.levels.ALL.toString()
    },
    replaceConsole: (env === "prod") ? false : true
});
// add mongo logger
var mongoAppender = require('log4js-node-mongodb');
log4js.addAppender(mongoAppender.appender({ connectionString: config.get("mongolab_uri_for_logs") }), 'mongo');
class LoggerMiddleware {
    use(request, response, next) {
        if (process.env.NODE_ENV === "dev")
            return log4js.connectLogger(log4js.getLogger("access"), {})(request, response, next);
        next();
    }
}
exports.LoggerMiddleware = LoggerMiddleware;
