"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const program = require("commander");
const queue_1 = require("../apps/domain/service/interpreter/queue");
const master_1 = require("../apps/domain/service/interpreter/master");
const film_1 = require("../apps/domain/repository/interpreter/film");
const screen_1 = require("../apps/domain/repository/interpreter/screen");
const theater_1 = require("../apps/domain/repository/interpreter/theater");
const performance_1 = require("../apps/domain/repository/interpreter/performance");
const transaction_1 = require("../apps/domain/repository/interpreter/transaction");
const queue_2 = require("../apps/domain/repository/interpreter/queue");
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
    .command("importTheater <theaterCode>")
    .description("import theater from COA.")
    .action((theaterCode) => __awaiter(this, void 0, void 0, function* () {
    mongoose.connect(MONGOLAB_URI);
    try {
        yield master_1.default.importTheater({
            theater_code: theaterCode
        })(theater_1.default);
    }
    catch (error) {
        console.error(error);
    }
    mongoose.disconnect();
}));
program
    .command("importFilms <theaterCode>")
    .description("import films from COA.")
    .action((theaterCode) => __awaiter(this, void 0, void 0, function* () {
    mongoose.connect(MONGOLAB_URI);
    try {
        yield master_1.default.importFilms({
            theater_code: theaterCode
        })(theater_1.default, film_1.default);
    }
    catch (error) {
        console.error(error);
    }
    mongoose.disconnect();
}));
program
    .command("importScreens <theaterCode>")
    .description("import screens from COA.")
    .action((theaterCode) => __awaiter(this, void 0, void 0, function* () {
    mongoose.connect(MONGOLAB_URI);
    try {
        yield master_1.default.importScreens({
            theater_code: theaterCode
        })(theater_1.default, screen_1.default);
    }
    catch (error) {
        console.error(error);
    }
    mongoose.disconnect();
}));
program
    .command("importPerformances <theaterCode> <day_start> <day_end>")
    .description("import performances from COA.")
    .action((theaterCode, start, end) => __awaiter(this, void 0, void 0, function* () {
    mongoose.connect(MONGOLAB_URI);
    try {
        yield master_1.default.importPerformances({
            theater_code: theaterCode,
            day_start: start,
            day_end: end
        })(film_1.default, screen_1.default, performance_1.default);
    }
    catch (error) {
        console.error(error);
    }
    mongoose.disconnect();
}));
program
    .command("importQueues")
    .description("import authorizations from transaction.")
    .action(() => __awaiter(this, void 0, void 0, function* () {
    mongoose.connect(MONGOLAB_URI);
    try {
        yield queue_1.default.importFromTransaction()(transaction_1.default, queue_2.default);
    }
    catch (error) {
        console.error(error.message);
    }
    mongoose.disconnect();
}));
program
    .command("settleAuthorization")
    .description("import authorizations from transaction.")
    .action(() => __awaiter(this, void 0, void 0, function* () {
    mongoose.connect(MONGOLAB_URI);
    try {
        yield queue_1.default.settleAuthorization()(queue_2.default);
    }
    catch (error) {
        console.error(error.message);
    }
    mongoose.disconnect();
}));
program
    .command("*")
    .action((env) => {
    console.log("deploying \"%s\"", env);
});
program.parse(process.argv);
