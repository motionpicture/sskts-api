"use strict";
/**
 * メール送信テスト
 *
 * @ignore
 */
const SSKTS = require("@motionpicture/sskts-domain");
const email = SSKTS.Notification.createEmail({
    from: 'test@localhost',
    to: 'ilovegadd@gmail.com',
    subject: 'test subject',
    // tslint:disable-next-line:no-multiline-string
    content: `
<!DOCTYPE html>
<html lang='ja'>
<head>
<meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
<title>購入完了</title>
</head>
<body>
<div style='padding:0 30px;font-family:'游ゴシック',meiryo,sans-serif;'>
    <p style='font-size:14px;'>
        この度はご購入いただき誠にありがとうございます。<br>
    </p>
    <hr style='margin:1em 0;'>
    <div style='margin-bottom:1em;'>
        <h3 style='font-weight:normal;font-size:14px;margin:0;'>購入番号 (Transaction number) :</h3>
        <strong>12345678</strong>
    </div>
</div>
</body>
</html>
`
});
SSKTS.NotificationService.sendEmail(email)().then(() => {
    // tslint:disable-next-line:no-console
    console.log('sent.');
}).catch((err) => {
    console.error(err);
});
