/**
 * Expressアプリケーション
 *
 * @module
 */

import * as bodyParser from 'body-parser';
import * as createDebug from 'debug';
import * as express from 'express';
// tslint:disable-next-line:no-require-imports
import expressValidator = require('express-validator');
import * as HTTPStatus from 'http-status';
import * as i18n from 'i18n';
import * as mongoose from 'mongoose';

import logger from './middlewares/logger';

const debug = createDebug('sskts-api:*');

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

app.use(logger);
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
(<any>mongoose).Promise = global.Promise;
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
import devRouter from './routers/dev';
import filmRouter from './routers/film';
import oauthRouter from './routers/oauth';
import performanceRouter from './routers/performance';
import screenRouter from './routers/screen';
import theaterRouter from './routers/theater';
import transactionRouter from './routers/transaction';
app.use('/oauth', oauthRouter);
app.use('/dev', devRouter);
app.use('/theaters', theaterRouter);
app.use('/films', filmRouter);
app.use('/screens', screenRouter);
app.use('/performances', performanceRouter);
app.use('/transactions', transactionRouter);

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
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

export = app;
