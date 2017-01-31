import EmailNotification from "../model/notification/email";

/**
 * 通知サービス
 */
interface NotificationService {
    /** メール送信 */
    sendEmail(email: EmailNotification): Promise<void>;
}

export default NotificationService;