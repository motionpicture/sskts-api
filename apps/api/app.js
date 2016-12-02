"use strict";
const express = require('express');
const bodyParser = require('body-parser');
// import mongoose = require('mongoose');
const i18n = require('i18n');
// import Models from '../common/models/Models';
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
if (process.env.NODE_ENV !== 'prod') {
    // サーバーエラーテスト
    app.get('/dev/500', (req, res) => {
        req.on('data', (chunk) => {
        });
        req.on('end', () => {
            throw new Error('500 manually.');
        });
    });
}
// view engine setup
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// i18n を利用する設定
i18n.configure({
    locales: ['en', 'ja'],
    defaultLocale: 'en',
    directory: __dirname + '/../../locales',
    objectNotation: true,
    updateFiles: false // ページのビューで自動的に言語ファイルを更新しない
});
// i18n の設定を有効化
app.use(i18n.init);
// let MONGOLAB_URI = conf.get<string>('mongolab_uri');
// mongoose.connect(MONGOLAB_URI, {
// });
// if (process.env.NODE_ENV !== 'prod') {
//     let db = mongoose.connection;
//     db.on('connecting', () => {
//         console.log('connecting');
//     });
//     db.on('error', (error) => {
//         console.error('Error in MongoDb connection: ', error);
//     });
//     db.on('connected', () => {
//         console.log('connected.');
//     });
//     db.once('open', () => {
//         console.log('connection open.');
//     });
//     db.on('reconnected', () => {
//         console.log('reconnected.');
//     });
//     db.on('disconnected', () => {
//         console.log('disconnected.');
//     });
// }
require("reflect-metadata");
const routing_controllers_1 = require("routing-controllers");
// import {useContainer, useExpressServer} from "routing-controllers";
// import {Container} from "typedi";
// its important to set container before any operation you do with routing-controllers,
// including importing controllers
// useContainer(Container);
// now import all our controllers. alternatively you can specify controllerDirs in routing-controller options
routing_controllers_1.useExpressServer(app, {
    controllers: [__dirname + "/controllers/**/*.js"],
    middlewares: [__dirname + "/middlewares/**/*.js"],
    defaultErrorHandler: false // disable default error handler, only if you have your own error handler
});
module.exports = app;
