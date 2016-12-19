"use strict";
const log4js = require("log4js");
const config = require("config");
let env = process.env.NODE_ENV || "dev";
log4js.configure({
    appenders: [
        {
            category: "access",
            // type: "dateFile",
            // filename: `${logDir}/access.log`,
            // pattern: "-yyyy-MM-dd",
            type: "log4js-node-mongodb",
            connectionString: config.get("mongolab_uri_for_logs"),
        },
        {
            category: "system",
            type: "log4js-node-mongodb",
            connectionString: config.get("mongolab_uri_for_logs"),
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = log4js.connectLogger(log4js.getLogger("access"), {});
