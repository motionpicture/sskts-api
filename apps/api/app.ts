import express = require("express");
import bodyParser = require("body-parser");
import expressValidator = require("express-validator");
import config = require("config");
import mongoose = require("mongoose");
import i18n = require("i18n");
// import passport = require("passport");
// import passportHttpBearer = require("passport-http-bearer");
// import Models from "../common/models/Models";

// let BearerStrategy = passportHttpBearer.Strategy;
// passport.use(new BearerStrategy(
//     (token, cb) => {
//         Models.Authentication.findOne(
//             {
//                 token: token
//             },
//             (err, authentication) => {
//                 if (err) return cb(err);
//                 if (!authentication) return cb(null, false);

//                 cb(null, authentication);
//             }
//         );
//     }
// ));

let app = express();


if (process.env.NODE_ENV !== "prod") {
    // サーバーエラーテスト
    app.get("/dev/500", (req) => {
        // req.on("data", (chunk) => {
        // });

        req.on("end", () => {
            throw new Error("500 manually.");
        })
    });
}

import logger from "./middlewares/logger";
app.use(logger);
// import benchmarks from "./middlewares/benchmarksMiddleware";
// app.use(benchmarks); // ベンチマーク的な

// view engine setup
app.set("views", `${__dirname}/views`);
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // The extended option allows to choose between parsing the URL-encoded data with the querystring library (when false) or the qs library (when true).
app.use(expressValidator({})); // this line must be immediately after any of the bodyParser middlewares!

// 静的ファイル
app.use(express.static(__dirname + "/../../public"));

// i18n を利用する設定
i18n.configure({
    locales: ["en", "ja"],
    defaultLocale: "en",
    directory: __dirname + "/../../locales",
    objectNotation: true,
    updateFiles: false // ページのビューで自動的に言語ファイルを更新しない
});
// i18n の設定を有効化
app.use(i18n.init);





let MONGOLAB_URI = config.get<string>("mongolab_uri");
mongoose.connect(MONGOLAB_URI, {
});
// if (process.env.NODE_ENV !== "prod") {
//     let db = mongoose.connection;
//     db.on("connecting", () => {
//         console.log("connecting");
//     });
//     db.on("error", (error) => {
//         console.error("Error in MongoDb connection: ", error);
//     });
//     db.on("connected", () => {
//         console.log("connected.");
//     });
//     db.once("open", () => {
//         console.log("connection open.");
//     });
//     db.on("reconnected", () => {
//         console.log("reconnected.");
//     });
//     db.on("disconnected", () => {
//         console.log("disconnected.");
//     });
// }

// routers
import devRouter from "./routers/dev";
import filmRouter from "./routers/film";
import performanceRouter from "./routers/performance";
import screenRouter from "./routers/screen";
import theaterRouter from "./routers/theater";
import transactionRouter from "./routers/transaction";
import authorizationRouter from "./routers/authorization";
import ownerRouter from "./routers/owner";
app.use("/dev", devRouter);
app.use("/", [
    filmRouter,
    performanceRouter,
    theaterRouter,
    screenRouter,
    transactionRouter,
    authorizationRouter,
    ownerRouter,
]);

// 404
app.use((req, res) => {
    res.json({
        success: false,
        message: `not found. [${req.originalUrl}]`
    });
});

// error handlers
app.use((err: any, req: express.Request, res: express.Response) => {
    console.error(err);
    res.json({
        success: false,
        message: `${err.message}. [${req.originalUrl}]`
    });
});

export = app;
