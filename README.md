# 佐々木興行チケットシステムAPIウェブアプリケーション

# Features

# Getting Started

## インフラ
基本的にnode.jsのウェブアプリケーション。
ウェブサーバーとしては、AzureのWebApps or GCPのAppEngine or AWSのelastic beanstalkを想定。
全てで動くように開発していくことが望ましい。

## 言語
実態としては、linuxあるいはwindows上でのnode.js。
プログラミング言語としては、alternative javascriptのひとつであるTypeScript。

* TypeScript(https://www.typescriptlang.org/)

## 開発方法
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

(http://localhost:8080)にアクセスすると、ローカルでウェブアプリを確認できます。


## Required environment variables
```shell
set NODE_ENV=**********環境名**********
set MONGOLAB_URI=**********mongodb接続URI**********
set SENDGRID_API_KEY=**********sendgrid api key**********
set GMO_ENDPOINT=**********gmo apiのエンドポイント**********
set COA_ENDPOINT=**********coa apiのエンドポイント**********
set COA_REFRESH_TOKEN=**********coa apiのリフレッシュトークン**********
set SSKTS_API_SECRET=**********本apiでjsonwebtoken署名に使用するシークレット文字列**********
set SSKTS_API_REFRESH_TOKEN=**********本apiのリフレッシュトークン**********
set SSKTS_DEVELOPER_EMAIL=**********本apiで使用される開発者メールアドレス**********
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


# tslint

コード品質チェックをtslintで行う。
* [tslint](https://github.com/palantir/tslint)
* [tslint-microsoft-contrib](https://github.com/Microsoft/tslint-microsoft-contrib)

`npm run check`でチェック実行。改修の際には、必ずチェックすること。


# clean
`npm run clean`で不要なソース削除。


# test
`npm test`でチェック実行。


# versioning
`npm version patch -f -m "enter your commit comment..."`でチェック実行。
