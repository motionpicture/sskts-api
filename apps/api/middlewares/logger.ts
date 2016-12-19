import log4js = require("log4js");
import config = require("config");

let env = process.env.NODE_ENV || "dev";

log4js.configure({
    appenders: [
        {
            category: "access", // アクセスログ
            // type: "dateFile",
            // filename: `${logDir}/access.log`,
            // pattern: "-yyyy-MM-dd",
            type: "log4js-node-mongodb",
            connectionString: config.get<string>("mongolab_uri_for_logs"),
        },
        {
            category: "system", // その他のアプリログ(DEBUG、INFO、ERRORなど)
            type: "log4js-node-mongodb",
            connectionString: config.get<string>("mongolab_uri_for_logs"),
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

export default log4js.connectLogger(log4js.getLogger("access"), {});
