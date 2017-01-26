import program = require("commander");
// import AssetService from "../domain/default/service/interpreter/asset";
import MasterService from "../domain/default/service/interpreter/master";
// import TransactionService from "../domain/default/service/interpreter/transaction";
import FilmRepository from "../domain/default/repository/interpreter/film";
import ScreenRepository from "../domain/default/repository/interpreter/screen";
import TheaterRepository from "../domain/default/repository/interpreter/theater";
import PerformanceRepository from "../domain/default/repository/interpreter/performance";
// import TransactionRepository from "../domain/default/repository/interpreter/transaction";
// import QueueRepository from "../domain/default/repository/interpreter/queue";
// import QueueStatus from "../domain/default/model/queueStatus";
// import QueueGroup from "../domain/default/model/queueGroup";

// let env = process.env.NODE_ENV || "dev";

import config = require("config");

import mongoose = require("mongoose");
mongoose.set('debug', true); // TODO 本番でははずす
// mongoose.connect(process.env.MONGOLAB_URI, {
// });
// process.on("SIGINT", function() {
//     mongoose.disconnect(() => {
//         process.exit(0);
//     });
// });

import COA = require("@motionpicture/coa-service");
COA.initialize({
    endpoint: config.get<string>("coa_api_endpoint"),
    refresh_token: config.get<string>("coa_api_refresh_token")
});


program
    .version("0.0.1")

program
    .command("importTheater <theaterCode>")
    .description("import theater from COA.")
    .action(async (theaterCode) => {
        try {
            mongoose.connect(process.env.MONGOLAB_URI);

            await MasterService.importTheater({
                theater_code: theaterCode
            })(TheaterRepository(mongoose.connection));
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
            mongoose.connect(process.env.MONGOLAB_URI);

            await MasterService.importFilms({
                theater_code: theaterCode
            })(TheaterRepository(mongoose.connection), FilmRepository(mongoose.connection));
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
            mongoose.connect(process.env.MONGOLAB_URI);

            await MasterService.importScreens({
                theater_code: theaterCode
            })(TheaterRepository(mongoose.connection), ScreenRepository(mongoose.connection));
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
            mongoose.connect(process.env.MONGOLAB_URI);

            await MasterService.importPerformances({
                theater_code: theaterCode,
                day_start: start,
                day_end: end
            })(
                FilmRepository(mongoose.connection), ScreenRepository(mongoose.connection), PerformanceRepository(mongoose.connection)
            );
        } catch (error) {
            console.error(error);
        }

        process.exit(0);
    });

// program
//     .command("enqueue4transaction")
//     .description("enqueue for a transaction.")
//     .action(async () => {
//         // mongoose.connect(MONGOLAB_URI);

//         try {
//             await TransactionService.enqueue({})(
//                 TransactionRepository, QueueRepository
//             );
//         } catch (error) {
//             console.error(error.message);
//         }

//         // mongoose.disconnect();
//     });

// program
//     .command("settleAuthorization")
//     .description("import authorizations from transaction.")
//     .action(async () => {
//         mongoose.connect(MONGOLAB_URI);

//         try {
//             let option = await QueueRepository.findOneAndUpdate({
//                 status: QueueStatus.UNEXECUTED,
//                 group: QueueGroup.SETTLE_AUTHORIZATION
//             }, { status: QueueStatus.RUNNING });
//             if (option.isEmpty) return;

//             // TODO 資産移動処理
//             let queue = option.get();
//             console.log("queue is", queue);
//             await AssetService.transfer(queue.authorization);

//             await QueueRepository.findOneAndUpdate({ _id: queue._id }, { status: QueueStatus.EXECUTED });
//         } catch (error) {
//             console.error(error.message);
//         }

//         mongoose.disconnect();
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