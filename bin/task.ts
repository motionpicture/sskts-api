import program = require("commander");
import * as theaterController from "../apps/api/controllers/theater";
import * as screenController from "../apps/api/controllers/screen";
import * as filmController from "../apps/api/controllers/film";
import * as performanceController from "../apps/api/controllers/performance";

import config = require('config');
import mongoose = require('mongoose');
let MONGOLAB_URI = config.get<string>('mongolab_uri');

// let env = process.env.NODE_ENV || "dev";

program
    .version("0.0.1")

program
    .command("importTheater <code>")
    .description("劇場情報インポート")
    .action((code, options) => {
        // let logDir = `${__dirname}/../../logs/${env}/task/Test${method.charAt(0).toUpperCase()}${method.slice(1)}`;
        mongoose.connect(MONGOLAB_URI);

        theaterController.importByCode(code).then(() => {
            console.log("importByCode processed.");
            mongoose.disconnect();
        }, (err) => {
            console.log("importByCode processed.", err);
            mongoose.disconnect();
        });
    });

program
    .command("importFilmsByTheaterCode <theaterCode>")
    .description("作品情報インポート")
    .action((theaterCode, options) => {
        // let logDir = `${__dirname}/../../logs/${env}/task/Test${method.charAt(0).toUpperCase()}${method.slice(1)}`;
        mongoose.connect(MONGOLAB_URI);

        filmController.importByTheaterCode(theaterCode).then(() => {
            console.log("importByTheaterCode processed.");
            mongoose.disconnect();
        }, (err) => {
            console.log("importByTheaterCode processed.", err);
            mongoose.disconnect();
        });
    });

program
    .command("importScreensByTheaterCode <theaterCode>")
    .description("スクリーン情報インポート")
    .action((theaterCode, options) => {
        // let logDir = `${__dirname}/../../logs/${env}/task/Test${method.charAt(0).toUpperCase()}${method.slice(1)}`;
        mongoose.connect(MONGOLAB_URI);

        screenController.importByTheaterCode(theaterCode).then(() => {
            console.log("importScreensByTheaterCode processed.");
            mongoose.disconnect();
        }, (err) => {
            console.log("importScreensByTheaterCode processed.", err);
            mongoose.disconnect();
        });
    });

program
    .command("importPerformancesByTheaterCode <theaterCode> <day_start> <day_end>")
    .description("パフォーマンス情報インポート")
    .action((theaterCode, start, end, options) => {
        // let logDir = `${__dirname}/../../logs/${env}/task/Test${method.charAt(0).toUpperCase()}${method.slice(1)}`;
        mongoose.connect(MONGOLAB_URI);

        performanceController.importByTheaterCode(theaterCode, start, end).then(() => {
            console.log("importPerformancesByTheaterCode processed.");
            mongoose.disconnect();
        }, (err) => {
            console.log("importPerformancesByTheaterCode processed.", err);
            mongoose.disconnect();
        });
    });

// import childProcess = require('child_process');
program
    .command("*")
    .action((env) => {
        console.log("deploying \"%s\"", env);
        // childProcess.exec(`node bin/task importTheater 001`, (error, stdout, stderr) => {
        //     if (error) {
        //         console.error(`exec error: ${error}`);
        //     }

        //     console.log(`stdout: ${stdout}`);
        //     console.log(`stderr: ${stderr}`);
        // });
    });

program.parse(process.argv);