# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## Unreleased
### Added
- COA本予約にムビチケ情報を連携するために、COA仮予約承認追加のパラメータを変更。

### Changed
- sskts-domainにて資産所有権認証記録スキーマが加わったことによる影響箇所を対応。

## v8.0.3 - 2017-05-17
### Fixed
- tslintオプションを変更。
```shell
"no-use-before-declare": true,
"object-literal-shorthand": true,
```

## v8.0.2 - 2017-05-17
### Fixed
- [tslint](https://github.com/palantir/tslint)を^5.2.0にアップデート。
- パッケージ依存関係を全体的にアップデート。
- npm testスクリプトを修正。

## v8.0.1 - 2017-04-17
### Added
- ファーストリリース
