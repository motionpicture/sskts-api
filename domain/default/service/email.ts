import Email from "../model/email";

/**
 * キューサービス
 */
interface EmailService {
    /** メール送信 */
    send(email: Email): Promise<void>;
}

export default EmailService;