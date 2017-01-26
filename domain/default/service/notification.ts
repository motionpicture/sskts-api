import Email from "../model/email";

/**
 * 通知サービス
 */
interface NotificationService {
    /** メール送信 */
    sendEmail(email: Email): Promise<void>;
}

export default NotificationService;