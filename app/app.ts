/**
 * Expressアプリケーション
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as createDebug from 'debug';
import * as express from 'express';
import expressValidator = require('express-validator'); // tslint:disable-line:no-require-imports
import * as helmet from 'helmet';
import * as i18n from 'i18n';

import mongooseConnectionOptions from '../mongooseConnectionOptions';

import basicAuth from './middlewares/basicAuth';
import errorHandler from './middlewares/errorHandler';
import notFoundHandler from './middlewares/notFoundHandler';
import devRouter from './routers/dev';
import filmRouter from './routers/film';
import healthRouter from './routers/health';
import oauthRouter from './routers/oauth';
import ownerRouter from './routers/owner';
import performanceRouter from './routers/performance';
import screenRouter from './routers/screen';
import theaterRouter from './routers/theater';
import transactionRouter from './routers/transaction';

const debug = createDebug('sskts-api:*');

const app = express();

app.use(basicAuth); // ベーシック認証
app.use(cors()); // enable All CORS Requests
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ['\'self\'']
        // styleSrc: ['\'unsafe-inline\'']
    }
}));
app.use((<any>helmet).referrerPolicy({ policy: 'no-referrer' })); // 型定義が非対応のためany
const SIXTY_DAYS_IN_SECONDS = 5184000;
app.use(helmet.hsts({
    maxAge: SIXTY_DAYS_IN_SECONDS,
    includeSubdomains: false
}));

if (process.env.NODE_ENV !== 'production') {
    // サーバーエラーテスト
    app.get('/dev/uncaughtexception', (req) => {
        req.on('data', (chunk) => {
            debug(chunk);
        });

        req.on('end', () => {
            throw new Error('uncaughtexception manually');
        });
    });
}

// view engine setup
// app.set('views', `${__dirname}/views`);
// app.set('view engine', 'ejs');

app.use(bodyParser.json());
// The extended option allows to choose between parsing the URL-encoded data
// with the querystring library (when false) or the qs library (when true).
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator({})); // this line must be immediately after any of the bodyParser middlewares!

// 静的ファイル
// app.use(express.static(__dirname + '/../../public'));

// i18n を利用する設定
i18n.configure({
    locales: ['en', 'ja'],
    defaultLocale: 'en',
    directory: `${__dirname}/../../locales`,
    objectNotation: true,
    updateFiles: false // ページのビューで自動的に言語ファイルを更新しない
});
// i18n の設定を有効化
app.use(i18n.init);

// @types/mongooseが古くて、新しいMongoDBクライアントの接続オプションに適合していない
// 型定義の更新待ち
sskts.mongoose.connect(process.env.MONGOLAB_URI, <any>mongooseConnectionOptions);

// routers
app.use('/health', healthRouter);
app.use('/oauth', oauthRouter);
app.use('/owners', ownerRouter);
app.use('/theaters', theaterRouter);
app.use('/films', filmRouter);
app.use('/screens', screenRouter);
app.use('/performances', performanceRouter);
app.use('/transactions', transactionRouter);

if (process.env.NODE_ENV !== 'production') {
    app.use('/dev', devRouter);
}

// 404
app.use(notFoundHandler);

// error handlers
app.use(errorHandler);

export = app;
