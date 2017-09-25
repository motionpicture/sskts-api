<img src="https://motionpicture.jp/images/common/logo_01.svg" alt="motionpicture" title="motionpicture" align="right" height="56" width="98"/>

# 佐々木興行チケットシステムAPIウェブアプリケーション

## Features

## Getting Started

### インフラ
基本的にnode.jsのウェブアプリケーション。
ウェブサーバーとしては、AzureのWebApps or GCPのAppEngine or AWSのelastic beanstalkを想定。
全てで動くように開発していくことが望ましい。

### 言語
実態としては、linuxあるいはwindows上でのnode.js。
プログラミング言語としては、TypeScript。

* TypeScript(https://www.typescriptlang.org/)

### 開発方法
npmでパッケージをインストール。

```shell
npm install
```
* npm(https://www.npmjs.com/)


typescriptをjavascriptにコンパイル。

```shell
npm run build -- -w
```

npmでローカルサーバーを起動。

```shell
npm start
```


### Required environment variables
```shell
set NODE_ENV=**********環境名**********
set MONGOLAB_URI=**********mongodb接続URI**********
set SENDGRID_API_KEY=**********sendgrid api key**********
set GMO_ENDPOINT=**********gmo apiのエンドポイント**********
set GMO_SITE_ID=**********GMOサイトID**********
set GMO_SITE_PASS=**********GMOサイトパス**********
set COA_ENDPOINT=**********coa apiのエンドポイント**********
set COA_REFRESH_TOKEN=**********coa apiのリフレッシュトークン**********
set SSKTS_DEVELOPER_EMAIL=**********本apiで使用される開発者メールアドレス**********
set REDIS_HOST=**********在庫状況保管用Redis Cacheホスト名**********
set REDIS_PORT=**********在庫状況保管用Redis Cacheポート番号**********
set REDIS_KEY=**********在庫状況保管用Redis Cache接続キー**********
set TRANSACTIONS_COUNT_UNIT_IN_SECONDS=**********取引数制限ユニット(秒)**********
set NUMBER_OF_TRANSACTIONS_PER_UNIT=**********ユニットあたりの最大取引数**********
set RESOURECE_SERVER_IDENTIFIER=**********リソースサーバーとしての固有識別子**********
set TOKEN_ISSUER=**********access token issuer(case sensitive URL using the https scheme)**********
```

テスト実行時

```shell
set TEST_API_ENDPOINT=**********テストに使用するAPIのエンドポイント**********
```

only on Aure WebApps

```shell
set WEBSITE_NODE_DEFAULT_VERSION=**********node.jsバージョン**********
set WEBSITE_TIME_ZONE=Tokyo Standard Time
```

ベーシック認証をかけたい場合

```shell
set SSKTS_API_BASIC_AUTH_NAME=**********認証ユーザー名**********
set SSKTS_API_BASIC_AUTH_PASS=**********認証パスワード**********
```


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


## ドキュメント
`npm run doc`でjsdocが作成されます。
