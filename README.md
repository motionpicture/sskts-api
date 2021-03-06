# SSKTS API web application

[![CircleCI](https://circleci.com/gh/motionpicture/sskts-api.svg?style=svg&circle-token=9a0b1ea029ad57360986a0e17fdc74948e78575e)](https://circleci.com/gh/motionpicture/sskts-api)

## Getting Started

### インフラ

基本的にNode.jsのウェブアプリケーション。
ウェブサーバーとしては、AzureのWebApps or GCPのAppEngine or AWSのelastic beanstalkを想定。
全てで動くように開発していくことが望ましい。

### 言語

実態としては、linuxあるいはwindows上でのnode.js。プログラミング言語としては、TypeScript。

* [TypeScript](https://www.typescriptlang.org/)

### 開発方法

npmでパッケージをインストール。

```shell
npm install
```

* [npm](https://www.npmjs.com/)

typescriptをjavascriptにコンパイル。

```shell
npm run build -- -w
```

npmでローカルサーバーを起動。

```shell
npm start
```

### Environment variables

| Name                                                 | Required              | Value       | Purpose                                |
| ---------------------------------------------------- | --------------------- | ----------- | -------------------------------------- |
| `DEBUG`                                              | false                 | sskts-api:* | Debug                                  |
| `NODE_ENV`                                           | true                  |             | environment name                       |
| `MONGOLAB_URI`                                       | true                  |             | MongoDB connection URI                 |
| `SENDGRID_API_KEY`                                   | true                  |             | SendGrid API Key                       |
| `GMO_ENDPOINT`                                       | true                  |             | GMO API endpoint                       |
| `GMO_SITE_ID`                                        | true                  |             | GMO SiteID                             |
| `GMO_SITE_PASS`                                      | true                  |             | GMO SitePass                           |
| `COA_ENDPOINT`                                       | true                  |             | COA API endpoint                       |
| `COA_REFRESH_TOKEN`                                  | true                  |             | COA API refresh token                  |
| `SSKTS_DEVELOPER_EMAIL`                              | true                  |             | 開発者通知用メールアドレス             |
| `REDIS_HOST`                                         | true                  |             | 在庫状況保管用Redis Cache host         |
| `REDIS_PORT`                                         | true                  |             | 在庫状況保管用Redis Cache port         |
| `REDIS_KEY`                                          | true                  |             | 在庫状況保管用Redis Cache key          |
| `RATE_LIMIT_REDIS_HOST`                              | true                  |             | レート制限用Redis Cache host           |
| `RATE_LIMIT_REDIS_PORT`                              | true                  |             | レート制限用Redis Cache port           |
| `RATE_LIMIT_REDIS_KEY`                               | true                  |             | レート制限用Redis Cache key            |
| `TRANSACTION_RATE_LIMIT_AGGREGATION_UNIT_IN_SECONDS` | true                  |             | 進行取引レート制限単位(秒)             |
| `TRANSACTION_RATE_LIMIT_THRESHOLD`                   | true                  |             | 進行取引レート制限閾値                 |
| `RESOURECE_SERVER_IDENTIFIER`                        | true                  |             | リソースサーバーとしての固有識別子     |
| `TOKEN_ISSUERS`                                      | true                  |             | トークン発行者リスト(コンマつなぎ)     |
| `WAITER_ENDPOINT`                                    | true                  |             | WAITER endpoint                        |
| `WAITER_SECRET`                                      | true                  |             | WAITER許可証トークン秘密鍵             |
| `ORDER_INQUIRY_ENDPOINT`                             | true                  |             | 注文照会URLエンドポイント              |
| `BASIC_AUTH_NAME`                                    | false                 |             | Basic authentication user name         |
| `BASIC_AUTH_PASS`                                    | false                 |             | Basic authentication user password     |
| `AWS_ACCESS_KEY_ID`                                  | true                  |             | AWSアクセスキー                        |
| `AWS_SECRET_ACCESS_KEY`                              | true                  |             | AWSシークレットアクセスキー            |
| `COGNITO_USER_POOL_ID`                               | true                  |             | CognitoユーザープールID             ID |
| `PECORINO_API_ENDPOINT`                              | true                  |             | PecorinoAPIエンドポイント              |
| `PECORINO_AUTHORIZE_SERVER_DOMAIN`                   | true                  |             | Pecorino認可サーバードメイン           |
| `PECORINO_API_CLIENT_ID`                             | true                  |             | PecorinoAPIクライアントID              |
| `PECORINO_API_CLIENT_SECRET`                         | true                  |             | PecorinoAPIクライアントシークレット    |
| `WEBSITE_NODE_DEFAULT_VERSION`                       | only on Azure WebApps |             | Node.js version                        |

## tslint

コード品質チェックをtslintで行う。

* [tslint](https://github.com/palantir/tslint)
* [tslint-microsoft-contrib](https://github.com/Microsoft/tslint-microsoft-contrib)

`npm run check`でチェック実行。

## パッケージ脆弱性のチェック

* [nsp](https://www.npmjs.com/package/nsp)

## clean

`npm run clean`で不要なソース削除。

## テスト

`npm test`でテスト実行。
