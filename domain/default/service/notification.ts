import EmailNotification from "../model/notification/email";
import SendGrid = require("sendgrid");

type SendGridOperation<T> = (sendgrid: typeof SendGrid) => Promise<T>;

/**
 * 通知サービス
 * 購入完了を何かしらの方法で通知したり、その他諸々誰かに何かを知らせる場合に必要なファンクション群
 * 
 * @interface NotificationService
 */
interface NotificationService {
    /**
     * メール送信
     * 
     * @param {EmailNotification} email メール通知
     */
    sendEmail(email: EmailNotification): SendGridOperation<void>;
}

export default NotificationService;