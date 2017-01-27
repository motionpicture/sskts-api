import monapt = require("monapt");
import ObjectId from "../model/objectId";
import Queue from "../model/queue";
import SendEmailQueue from "../model/queue/sendEmail";
import GMOAuthorization from "../model/authorization/gmo";
import COASeatReservationAuthorization from "../model/authorization/coaSeatReservation";

/**
 * GMO実売上キューインターフェース
 */
interface SettleGMOAuthorizationQueue {
    _id: string,
    authorization: GMOAuthorization
}

/**
 * COA座席本予約キューインターフェース
 */
interface SettleCOASeatReservationAuthorizationQueue {
    _id: string,
    authorization: COASeatReservationAuthorization
}

interface QueueRepository {
    find(conditions: Object): Promise<Array<Queue>>;
    findById(id: ObjectId): Promise<monapt.Option<Queue>>;
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Queue>>;
    findOneSendEmailAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<SendEmailQueue>>;
    findOneSettleGMOAuthorizationAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<SettleGMOAuthorizationQueue>>;
    findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<SettleCOASeatReservationAuthorizationQueue>>;
    store(queue: Queue): Promise<void>;
}

export default QueueRepository;