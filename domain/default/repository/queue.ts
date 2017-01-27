import monapt = require("monapt");
import Queue from "../model/queue";
import SendEmailQueue from "../model/queue/sendEmail";
import GMOAuthorization from "../model/authorization/gmo";

/**
 * GMO実売上キューインターフェース
 */
interface SettleGMOAuthorizationQueue {
    _id: string,
    authorization: GMOAuthorization
}

interface QueueRepository {
    find(conditions: Object): Promise<Array<Queue>>;
    findById(id: string): Promise<monapt.Option<Queue>>;
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Queue>>;
    findOneSendEmailAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<SendEmailQueue>>;
    findOneSettleGMOAuthorizationAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<SettleGMOAuthorizationQueue>>;
    store(queue: Queue): Promise<void>;
}

export default QueueRepository;