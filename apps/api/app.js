"use strict";
const express = require("express");
const bodyParser = require("body-parser");
// import conf = require("config");
// import mongoose = require("mongoose");
const i18n = require("i18n");
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
    app.get("/dev/500", (req, res) => {
        req.on("data", (chunk) => {
        });
        req.on("end", () => {
            throw new Error("500 manually.");
        });
    });
}
// import benchmarks from './middlewares/benchmarksMiddleware';
// app.use(benchmarks); // ベンチマーク的な
// view engine setup
app.set("views", `${__dirname}/views`);
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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
// let MONGOLAB_URI = conf.get<string>("mongolab_uri");
// mongoose.connect(MONGOLAB_URI, {
// });
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
const devRouter_1 = require("./routers/devRouter");
const filmRouter_1 = require("./routers/filmRouter");
const theaterRouter_1 = require("./routers/theaterRouter");
app.use('/dev', devRouter_1.default);
app.use('/', filmRouter_1.default);
app.use('/', theaterRouter_1.default);
// 404
app.use((req, res, next) => {
    res.json({
        success: false,
        message: "Not Found"
    });
});
// error handlers
app.use((err, req, res, next) => {
    console.error(err);
    res.json({
        success: false,
        message: err.message
    });
});
module.exports = app;
