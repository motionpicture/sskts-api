"use strict";
const program = require("commander");
const Tasks = require("./tasks");
const config = require("config");
const COA = require("@motionpicture/coa-service");
COA.initialize({
    endpoint: config.get("coa_api_endpoint"),
    refresh_token: config.get("coa_api_refresh_token")
});
program
    .version("0.0.1");
program
    .command("importTheater <code>")
    .description("import theater from COA.")
    .action((code) => {
    Tasks.importTheater(code);
});
program
    .command("*")
    .action((env) => {
    console.log("deploying \"%s\"", env);
});
program.parse(process.argv);
