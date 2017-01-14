"use strict";
const program = require("commander");
const master_1 = require("../apps/domain/service/interpreter/master");
const theater_1 = require("../apps/domain/repository/interpreter/theater");
const config = require("config");
const mongoose = require("mongoose");
let MONGOLAB_URI = config.get("mongolab_uri");
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
    mongoose.connect(MONGOLAB_URI);
    master_1.default.importTheater(code)(theater_1.default).then(() => {
        mongoose.disconnect();
    }, (err) => {
        console.error(err);
        mongoose.disconnect();
    });
});
program
    .command("*")
    .action((env) => {
    console.log("deploying \"%s\"", env);
});
program.parse(process.argv);
