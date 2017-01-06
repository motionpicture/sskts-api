import express = require('express')
let router = express.Router();
import mongoose = require("mongoose");
import conf = require("config");
let MONGOLAB_URI = conf.get<string>("mongolab_uri");

// middleware that is specific to this router
// router.use((req, res, next) => {
//   console.log('Time: ', Date.now())
//   next()
// })

router.get("/environmentVariables", (req, res) => {
    console.log("ip:", req.ip);
    // this.logger.debug("process.env:", process.env);
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
        } else {
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
        } else {
            res.json({
                success: true,
                message: "disconnected."
            });
        }
    });
});

export default router;