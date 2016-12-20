import program = require("commander");
import * as theaterController from "../apps/task/controllers/theater";
import * as screenController from "../apps/task/controllers/screen";
import * as filmController from "../apps/task/controllers/film";
import * as performanceController from "../apps/task/controllers/performance";

// let env = process.env.NODE_ENV || "dev";

program
    .version("0.0.1")

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
    .command("importPerformancesByTheaterCode <theaterCode>")
    .description("パフォーマンス情報インポート")
    .action((theaterCode, options) => {
        // let logDir = `${__dirname}/../../logs/${env}/task/Test${method.charAt(0).toUpperCase()}${method.slice(1)}`;
        performanceController.importByTheaterCode(theaterCode);
    });

// program
//   .command("*")
//   .action(function(env){
//     console.log("deploying "%s"", env);
//   });

program.parse(process.argv);