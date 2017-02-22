/**
 * Expressアプリケーション
 *
 * @module
 */
"use strict";
const bodyParser = require("body-parser");
const createDebug = require("debug");
const express = require("express");
// tslint:disable-next-line:no-require-imports
const expressValidator = require("express-validator");
const HTTPStatus = require("http-status");
const i18n = require("i18n");
const mongoose = require("mongoose");
// import passport = require('passport');
// import passportHttpBearer = require('passport-http-bearer');
const debug = createDebug('sskts-api:*');
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
const app = express();
if (process.env.NODE_ENV !== 'prod') {
    // サーバーエラーテスト
    app.get('/dev/500', (req) => {
        req.on('data', (chunk) => {
            debug(chunk);
        });
        req.on('end', () => {
            throw new Error('500 manually.');
        });
    });
}
const logger_1 = require("./middlewares/logger");
app.use(logger_1.default);
// import benchmarks from './middlewares/benchmarksMiddleware';
// app.use(benchmarks); // ベンチマーク的な
// view engine setup
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(bodyParser.json());
// The extended option allows to choose between parsing the URL-encoded data
// with the querystring library (when false) or the qs library (when true).
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator({})); // this line must be immediately after any of the bodyParser middlewares!
// 静的ファイル
app.use(express.static(__dirname + '/../../public'));
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
// mongoose.set('debug', true); // todo 本番でははずす
// Use native promises
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);
// process.on('SIGINT', function() {
//     mongoose.disconnect(() => {
//         process.exit(0);
//     });
// });
// if (process.env.NODE_ENV !== 'prod') {
//     let db = mongoose.connection;
//     db.on('connecting', () => {
//         debug('connecting');
//     });
//     db.on('error', (error) => {
//         console.error('Error in MongoDb connection: ', error);
//     });
//     db.on('connected', () => {
//         debug('connected.');
//     });
//     db.once('open', () => {
//         debug('connection open.');
//     });
//     db.on('reconnected', () => {
//         debug('reconnected.');
//     });
//     db.on('disconnected', () => {
//         debug('disconnected.');
//     });
// }
// routers
const dev_1 = require("./routers/dev");
const film_1 = require("./routers/film");
const performance_1 = require("./routers/performance");
const screen_1 = require("./routers/screen");
const theater_1 = require("./routers/theater");
const transaction_1 = require("./routers/transaction");
app.use('/dev', dev_1.default);
app.use('/theaters', theater_1.default);
app.use('/films', film_1.default);
app.use('/screens', screen_1.default);
app.use('/performances', performance_1.default);
app.use('/transactions', transaction_1.default);
// 404
app.use((req, res) => {
    res.status(HTTPStatus.NOT_FOUND);
    res.json({
        errors: [
            {
                code: 'NotFound',
                description: `router for [${req.originalUrl}] not found.`
            }
        ]
    });
});
// error handlers
app.use((err, req, res, next) => {
    console.error(req.originalUrl, req.query, req.params, req.body, err);
    if (res.headersSent) {
        return next(err);
    }
    res.status(HTTPStatus.BAD_REQUEST);
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
