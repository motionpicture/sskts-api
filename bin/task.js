"use strict";
const program = require("commander");
const theaterController = require("../apps/task/controllers/theater");
const screenController = require("../apps/task/controllers/screen");
const filmController = require("../apps/task/controllers/film");
const performanceController = require("../apps/task/controllers/performance");
// let env = process.env.NODE_ENV || "dev";
program
    .version("0.0.1");
program
    .command("importTheater <code>")
    .description("劇場情報インポート")
    .action((code, options) => {
    // let logDir = `${__dirname}/../../logs/${env}/task/Test${method.charAt(0).toUpperCase()}${method.slice(1)}`;
    theaterController.importByCode(code);
});
program
    .command("importFilmsByTheaterCode <theaterCode>")
    .description("作品情報インポート")
    .action((theaterCode, options) => {
    // let logDir = `${__dirname}/../../logs/${env}/task/Test${method.charAt(0).toUpperCase()}${method.slice(1)}`;
    filmController.importByTheaterCode(theaterCode);
});
program
    .command("importScreensByTheaterCode <theaterCode>")
    .description("スクリーン情報インポート")
    .action((theaterCode, options) => {
    // let logDir = `${__dirname}/../../logs/${env}/task/Test${method.charAt(0).toUpperCase()}${method.slice(1)}`;
    screenController.importByTheaterCode(theaterCode);
});
program
    .command("importPerformancesByTheaterCode <theaterCode> <day_start> <day_end>")
    .description("パフォーマンス情報インポート")
    .action((theaterCode, start, end, options) => {
    // let logDir = `${__dirname}/../../logs/${env}/task/Test${method.charAt(0).toUpperCase()}${method.slice(1)}`;
    performanceController.importByTheaterCode(theaterCode, start, end);
});
// program
//   .command("*")
//   .action(function(env){
//     console.log("deploying "%s"", env);
//   });
program.parse(process.argv);
