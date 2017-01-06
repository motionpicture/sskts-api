"use strict";
const express = require("express");
let router = express.Router();
const mongoose = require("mongoose");
const conf = require("config");
let MONGOLAB_URI = conf.get("mongolab_uri");
router.get("/environmentVariables", (req, res) => {
    console.log("ip:", req.ip);
    res.json({
        success: true,
        variables: process.env
    });
});
router.get("/mongoose/connect", (req, res) => {
    console.log("ip:", req.ip);
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
    });
});
router.get("/mongoose/disconnect", (req, res) => {
    console.log("ip:", req.ip);
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
    });
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
