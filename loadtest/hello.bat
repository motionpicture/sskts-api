@echo off

REM
REM hello.yml負荷テスト
REM

REM このバッチが存在するフォルダをカレントに
pushd %0\..\..\loadtest
cls

REM 開始値、増分、終了値でループ
for /L %%i in (1,1,4) do (
    start artillery run hello.yml -e dev
    REM start cmd /c artillery run hello.yml -e dev
    timeout 1
)
pause
REM exit
