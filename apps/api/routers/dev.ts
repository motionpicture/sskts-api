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
        variables: process.env
    });
});

router.get("/mongoose/connect", (req, res, next) => {
    console.log("ip:", req.ip);
    mongoose.connect(MONGOLAB_URI, (err) => {
        if (err) return next(err);

        res.json({
            message: "connected."
        });
    });
});

router.get("/mongoose/disconnect", (req, res, next) => {
    console.log("ip:", req.ip);
    mongoose.disconnect((err) => {
        if (err) return next(err);

        res.json({
            message: "disconnected."
        });
    });
});

export default router;