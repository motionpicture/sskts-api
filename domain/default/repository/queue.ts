import monapt = require("monapt");
import ObjectId from "../model/objectId";
import Queue from "../model/queue";
import GMOAuthorization from "../model/authorization/gmo";
import COASeatReservationAuthorization from "../model/authorization/coaSeatReservation";
import NotificationPushQueue from "../model/queue/notificationPush";
import EmailNotification from "../model/notification/email";

/**
 * GMO実売上キューインターフェース
 */
interface SettleGMOAuthorizationQueue {
    _id: ObjectId,
    authorization: GMOAuthorization
}

/**
 * GMOオーソリ取消キューインターフェース
 */
interface CancelGMOAuthorizationQueue {
    _id: ObjectId,
    authorization: GMOAuthorization
}

/**
 * COA座席本予約キューインターフェース
 */
interface SettleCOASeatReservationAuthorizationQueue {
    _id: ObjectId,
    authorization: COASeatReservationAuthorization
}

interface QueueRepository {
    find(conditions: Object): Promise<Array<Queue>>;
    findById(id: ObjectId): Promise<monapt.Option<Queue>>;
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Queue>>;
    findOneSendEmailAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<NotificationPushQueue<EmailNotification>>>;
    findOneSettleGMOAuthorizationAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<SettleGMOAuthorizationQueue>>;
    findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<SettleCOASeatReservationAuthorizationQueue>>;
    findOneCancelGMOAuthorizationAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<CancelGMOAuthorizationQueue>>;
    store(queue: Queue): Promise<void>;
}

export default QueueRepository;