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
const master_1 = require("../domain/default/service/interpreter/master");
const film_1 = require("../domain/default/repository/interpreter/film");
const screen_1 = require("../domain/default/repository/interpreter/screen");
const theater_1 = require("../domain/default/repository/interpreter/theater");
const performance_1 = require("../domain/default/repository/interpreter/performance");
const mongoose = require("mongoose");
mongoose.set('debug', true);
program
    .version("0.0.1");
program
    .command("importTheater <theaterCode>")
    .description("import theater from COA.")
    .action((theaterCode) => __awaiter(this, void 0, void 0, function* () {
    try {
        mongoose.Promise = global.Promise;
        mongoose.connect(process.env.MONGOLAB_URI);
        yield master_1.default.importTheater({
            theater_code: theaterCode
        })(theater_1.default(mongoose.connection));
    }
    catch (error) {
        console.error(error);
    }
    mongoose.disconnect();
    process.exit(0);
}));
program
    .command("importFilms <theaterCode>")
    .description("import films from COA.")
    .action((theaterCode) => __awaiter(this, void 0, void 0, function* () {
    try {
        mongoose.Promise = global.Promise;
        mongoose.connect(process.env.MONGOLAB_URI);
        yield master_1.default.importFilms({
            theater_code: theaterCode
        })(theater_1.default(mongoose.connection), film_1.default(mongoose.connection));
    }
    catch (error) {
        console.error(error);
    }
    mongoose.disconnect();
    process.exit(0);
}));
program
    .command("importScreens <theaterCode>")
    .description("import screens from COA.")
    .action((theaterCode) => __awaiter(this, void 0, void 0, function* () {
    try {
        mongoose.Promise = global.Promise;
        mongoose.connect(process.env.MONGOLAB_URI);
        yield master_1.default.importScreens({
            theater_code: theaterCode
        })(theater_1.default(mongoose.connection), screen_1.default(mongoose.connection));
    }
    catch (error) {
        console.error(error);
    }
    mongoose.disconnect();
    process.exit(0);
}));
program
    .command("importPerformances <theaterCode> <day_start> <day_end>")
    .description("import performances from COA.")
    .action((theaterCode, start, end) => __awaiter(this, void 0, void 0, function* () {
    try {
        mongoose.Promise = global.Promise;
        mongoose.connect(process.env.MONGOLAB_URI);
        yield master_1.default.importPerformances({
            theater_code: theaterCode,
            day_start: start,
            day_end: end
        })(film_1.default(mongoose.connection), screen_1.default(mongoose.connection), performance_1.default(mongoose.connection));
    }
    catch (error) {
        console.error(error);
    }
    process.exit(0);
}));
program
    .command("watchTransactions")
    .description("enqueue for a transaction.")
    .action(() => {
});
program
    .command("watchSendEmailQueue")
    .description("")
    .action(() => {
});
program
    .command("*")
    .action((env) => {
    console.log("deploying \"%s\"", env);
});
program.parse(process.argv);
