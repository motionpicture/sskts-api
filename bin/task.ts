import program = require("commander");
// import ScreenRepository from "../apps/common/infrastructure/persistence/mongoose/repositories/screen";
// import FilmRepository from "../apps/common/infrastructure/persistence/mongoose/repositories/film";
// import PerformanceRepository from "../apps/common/infrastructure/persistence/mongoose/repositories/performance";
// import TicketRepository from "../apps/common/infrastructure/persistence/mongoose/repositories/ticket";
import * as Tasks from "./tasks";

// let env = process.env.NODE_ENV || "dev";

import config = require("config");
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
        Tasks.importTheater(code);
    });

// program
//     .command("importFilmsByTheaterCode <theaterCode>")
//     .description("import films from COA.")
//     .action((theaterCode) => {
//         mongoose.connect(MONGOLAB_URI);

//         FilmRepository.importByTheaterCode(theaterCode).then(() => {
//             console.log("importByTheaterCode processed.");
//             mongoose.disconnect();
//         }, (err) => {
//             console.log("importByTheaterCode processed.", err);
//             mongoose.disconnect();
//         });
//     });

// program
//     .command("importScreensByTheaterCode <theaterCode>")
//     .description("import screens from COA.")
//     .action((theaterCode) => {
//         mongoose.connect(MONGOLAB_URI);

//         ScreenRepository.importByTheaterCode(theaterCode).then(() => {
//             console.log("importScreensByTheaterCode processed.");
//             mongoose.disconnect();
//         }, (err) => {
//             console.log("importScreensByTheaterCode processed.", err);
//             mongoose.disconnect();
//         });
//     });

// program
//     .command("importPerformancesByTheaterCode <theaterCode> <day_start> <day_end>")
//     .description("import performances from COA.")
//     .action((theaterCode, start, end) => {
//         mongoose.connect(MONGOLAB_URI);

//         PerformanceRepository.importByTheaterCode(theaterCode, start, end).then(() => {
//             console.log("importPerformancesByTheaterCode processed.");
//             mongoose.disconnect();
//         }, (err) => {
//             console.log("importPerformancesByTheaterCode processed.", err);
//             mongoose.disconnect();
//         });
//     });

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