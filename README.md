# 佐々木興行チケットシステムAPIウェブアプリケーション

# Features

# Getting Started

## インフラ
基本的にnode.jsのウェブアプリケーション。
ウェブサーバーとしては、AzureのWebAppsあるいはGCPのAppEngineを想定。
両方で動くように開発していくことが望ましい。

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
npm run build
```

npmでローカルサーバーを起動。

```shell
npm start
```

(http://localhost:8080)にアクセスすると、ローカルでウェブアプリを確認できます。


## Required environment variables
```shell
set NODE_ENV=**********
set MONGOLAB_URI=**********
set SENDGRID_API_KEY=**********
set GMO_ENDPOINT=**********
set COA_ENDPOINT=**********
set COA_REFRESH_TOKEN=**********
set SSKTS_API_SECRET==**********
set SSKTS_API_REFRESH_TOKEN==**********
```

only on Aure WebApps

```shell
set WEBSITE_NODE_DEFAULT_VERSION=**********
set WEBSITE_TIME_ZONE=Tokyo Standard Time
```


# tslint

コード品質チェックをtslintで行う。
* [tslint](https://github.com/palantir/tslint)
* [tslint-microsoft-contrib](https://github.com/Microsoft/tslint-microsoft-contrib)

`npm run check`でチェック実行。改修の際には、必ずチェックすること。


# test
`npm test`でチェック実行。


# versioning
`npm version patch -f -m "enter your commit comment..."`でチェック実行。
