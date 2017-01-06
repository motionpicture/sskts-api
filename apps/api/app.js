"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const config = require("config");
const mongoose = require("mongoose");
const i18n = require("i18n");
let app = express();
if (process.env.NODE_ENV !== "prod") {
    app.get("/dev/500", (req) => {
        req.on("end", () => {
            throw new Error("500 manually.");
        });
    });
}
const logger_1 = require("./middlewares/logger");
app.use(logger_1.default);
app.set("views", `${__dirname}/views`);
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator({}));
app.use(express.static(__dirname + "/../../public"));
i18n.configure({
    locales: ["en", "ja"],
    defaultLocale: "en",
    directory: __dirname + "/../../locales",
    objectNotation: true,
    updateFiles: false
});
app.use(i18n.init);
let MONGOLAB_URI = config.get("mongolab_uri");
mongoose.connect(MONGOLAB_URI, {});
const dev_1 = require("./routers/dev");
const film_1 = require("./routers/film");
const performance_1 = require("./routers/performance");
const screen_1 = require("./routers/screen");
const theater_1 = require("./routers/theater");
const transaction_1 = require("./routers/transaction");
const authorization_1 = require("./routers/authorization");
const owner_1 = require("./routers/owner");
app.use("/dev", dev_1.default);
app.use("/", [
    film_1.default,
    performance_1.default,
    theater_1.default,
    screen_1.default,
    transaction_1.default,
    authorization_1.default,
    owner_1.default,
]);
app.use((req, res) => {
    res.json({
        success: false,
        message: `not found. [${req.originalUrl}]`
    });
});
app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent)
        return next(err);
    res.json({
        success: false,
        message: `${err.message}`,
        url: `${req.url}`,
    });
});
module.exports = app;
