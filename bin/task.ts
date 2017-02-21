import program = require("commander");

import mongoose = require("mongoose");
mongoose.set('debug', true); // TODO 本番でははずす
// mongoose.connect(process.env.MONGOLAB_URI, {
// });
// process.on("SIGINT", function() {
//     mongoose.disconnect(() => {
//         process.exit(0);
//     });
// });

// import COA = require("@motionpicture/coa-service");
// COA.initialize({
//     endpoint: config.get<string>("coa_api_endpoint"),
//     refresh_token: config.get<string>("coa_api_refresh_token")
// });

import * as SSKTS from '@motionpicture/sskts-domain';

program
    .version("0.0.1")

program
    .command("importTheater <theaterCode>")
    .description("import theater from COA.")
    .action(async (theaterCode) => {
        try {
            mongoose.Promise = global.Promise;
            mongoose.connect(process.env.MONGOLAB_URI);

            await SSKTS.MasterService.importTheater(theaterCode)(SSKTS.createTheaterRepository(mongoose.connection));
        } catch (error) {
            console.error(error);
        }

        mongoose.disconnect();
        process.exit(0);
    });

program
    .command("importFilms <theaterCode>")
    .description("import films from COA.")
    .action(async (theaterCode) => {
        try {
            mongoose.Promise = global.Promise;
            mongoose.connect(process.env.MONGOLAB_URI);

            await SSKTS.MasterService.importFilms(theaterCode)(
                SSKTS.createTheaterRepository(mongoose.connection),
                SSKTS.createFilmRepository(mongoose.connection),
            )
        } catch (error) {
            console.error(error);
        }

        mongoose.disconnect();
        process.exit(0);
    });

program
    .command("importScreens <theaterCode>")
    .description("import screens from COA.")
    .action(async (theaterCode) => {
        try {
            mongoose.Promise = global.Promise;
            mongoose.connect(process.env.MONGOLAB_URI);

            await SSKTS.MasterService.importScreens(theaterCode)(
                SSKTS.createTheaterRepository(mongoose.connection),
                SSKTS.createScreenRepository(mongoose.connection)
            )
        } catch (error) {
            console.error(error);
        }

        mongoose.disconnect();
        process.exit(0);
    });

program
    .command("importPerformances <theaterCode> <day_start> <day_end>")
    .description("import performances from COA.")
    .action(async (theaterCode, start, end) => {
        try {
            mongoose.Promise = global.Promise;
            mongoose.connect(process.env.MONGOLAB_URI);

            await SSKTS.MasterService.importPerformances(theaterCode, start, end)(
                SSKTS.createFilmRepository(mongoose.connection),
                SSKTS.createScreenRepository(mongoose.connection),
                SSKTS.createPerformanceRepository(mongoose.connection)
            )
        } catch (error) {
            console.error(error);
        }

        process.exit(0);
    });

program
    .command("watchTransactions")
    .description("enqueue for a transaction.")
    .action(() => {
    });

program
    .command("watchSendEmailQueue")
    .description("")
    .action(() => {

        // mongoose.disconnect();
        // process.exit(0);
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