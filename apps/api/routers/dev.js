"use strict";
const express = require("express");
let router = express.Router();
const mongoose = require("mongoose");
const conf = require("config");
let MONGOLAB_URI = conf.get("mongolab_uri");
// middleware that is specific to this router
// router.use((req, res, next) => {
//   console.log('Time: ', Date.now())
//   next()
// })
router.get("/environmentVariables", (req, res, next) => {
    // this.logger.debug("process.env:", process.env);
    res.json({
        success: true,
        variables: process.env
    });
});
router.get("/mongoose/connect", (req, res, next) => {
    mongoose.connect(MONGOLAB_URI, (err) => {
        if (err) {
            res.json({
                success: false,
                message: err.message
            });
        }
        else {
            res.json({
                success: true,
                message: "connected."
            });
        }
        return;
    });
});
router.get("/mongoose/disconnect", (req, res, next) => {
    mongoose.disconnect((err) => {
        if (err) {
            res.json({
                success: false,
                message: err.message
            });
        }
        else {
            res.json({
                success: true,
                message: "disconnected."
            });
        }
        return;
    });
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
