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
mongoose.set('debug', true);
const COA = require("@motionpicture/coa-service");
COA.initialize({
    endpoint: config.get("coa_api_endpoint"),
    refresh_token: config.get("coa_api_refresh_token")
});
const GMO = require("@motionpicture/gmo-service");
GMO.initialize({
    endpoint: "https://pt01.mul-pay.jp",
});
const dev_1 = require("./routers/dev");
const theater_1 = require("./routers/theater");
const film_1 = require("./routers/film");
const performance_1 = require("./routers/performance");
const screen_1 = require("./routers/screen");
const owner_1 = require("./routers/owner");
const transaction_1 = require("./routers/transaction");
app.use("/dev", dev_1.default);
app.use("/theaters", theater_1.default);
app.use("/films", film_1.default);
app.use("/screens", screen_1.default);
app.use("/performances", performance_1.default);
app.use("/owners", owner_1.default);
app.use("/transactions", transaction_1.default);
app.use((req, res) => {
    res.status(404);
    res.json({
        errors: [
            {
                code: `NotFound`,
                description: `router for [${req.originalUrl}] not found.`
            }
        ]
    });
});
app.use((err, req, res, next) => {
    console.error(req.originalUrl, req.query, req.params, req.body, err);
    if (res.headersSent)
        return next(err);
    res.status(400);
    res.json({
        errors: [
            {
                code: `${err.name}`,
                description: `${err.message}`
            }
        ]
    });
});
module.exports = app;
