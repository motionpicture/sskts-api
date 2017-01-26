import monapt = require("monapt");
import SendEmailQueue from "../../model/queue/sendEmail";

interface SendEmailQueueRepository {
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<SendEmailQueue>>;
}

export default SendEmailQueueRepository;