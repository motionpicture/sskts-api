import program = require("commander");
import MasterService from "../apps/domain/service/interpreter/master";
import FilmRepository from "../apps/domain/repository/interpreter/film";
import ScreenRepository from "../apps/domain/repository/interpreter/screen";
import TheaterRepository from "../apps/domain/repository/interpreter/theater";
import PerformanceRepository from "../apps/domain/repository/interpreter/performance";

// let env = process.env.NODE_ENV || "dev";

import config = require("config");

import mongoose = require("mongoose");
let MONGOLAB_URI = config.get<string>("mongolab_uri");

import COA = require("@motionpicture/coa-service");
COA.initialize({
    endpoint: config.get<string>("coa_api_endpoint"),
    refresh_token: config.get<string>("coa_api_refresh_token")
});


program
    .version("0.0.1")

program
    .command("importTheater <code>")
    .description("import theater from COA.")
    .action((code) => {
        mongoose.connect(MONGOLAB_URI);
        MasterService.importTheater(code)(TheaterRepository).then(() => {
            mongoose.disconnect();
        }, (err) => {
            console.error(err);
            mongoose.disconnect();
        });
    });

program
    .command("importFilms <theaterCode>")
    .description("import films from COA.")
    .action((theaterCode) => {
        mongoose.connect(MONGOLAB_URI);

        MasterService.importFilms(theaterCode)(FilmRepository).then(() => {
            console.log("importFilms processed.");
            mongoose.disconnect();
        }, (err) => {
            console.log("importFilms processed.", err);
            mongoose.disconnect();
        });
    });

program
    .command("importScreens <theaterCode>")
    .description("import screens from COA.")
    .action((theaterCode) => {
        mongoose.connect(MONGOLAB_URI);

        MasterService.importScreens(theaterCode)(ScreenRepository).then(() => {
            console.log("importScreens processed.");
            mongoose.disconnect();
        }, (err) => {
            console.log("importScreens processed.", err);
            mongoose.disconnect();
        });
    });

program
    .command("importPerformances <theaterCode> <day_start> <day_end>")
    .description("import performances from COA.")
    .action((theaterCode, start, end) => {
        mongoose.connect(MONGOLAB_URI);

        MasterService.importPerformances(theaterCode, start, end)(
            TheaterRepository, ScreenRepository, PerformanceRepository
        ).then(() => {
            console.log("importPerformances processed.");
            mongoose.disconnect();
        }, (err) => {
            console.log("importPerformances processed.", err);
            mongoose.disconnect();
        });
    });

// program
//     .command("importSeatAvailability <theaterCode> <day_start> <day_end>")
//     .description("import seat availability.")
//     .action((theaterCode, start, end) => {
//         mongoose.connect(MONGOLAB_URI);

//         PerformanceRepository.importSeatAvailability(theaterCode, start, end).then(() => {
//             console.log("importSeatAvailability processed.");
//             mongoose.disconnect();
//         }, (err) => {
//             console.log("importSeatAvailability processed.", err);
//             mongoose.disconnect();
//         });
//     });

// program
//     .command("importTickets <theaterCode>")
//     .description("import tickets.")
//     .action((theaterCode) => {
//         mongoose.connect(MONGOLAB_URI);

//         TicketRepository.importByTheaterCode(theaterCode).then(() => {
//             console.log("importTickets processed.");
//             mongoose.disconnect();
//         }, (err) => {
//             console.log("importTickets processed.", err);
//             mongoose.disconnect();
//         });
//     });

// import childProcess = require("child_process");
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