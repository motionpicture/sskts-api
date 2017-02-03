import monapt = require("monapt");
import ObjectId from "../model/objectId";
import Queue from "../model/queue";
import GMOAuthorization from "../model/authorization/gmo";
import COASeatReservationAuthorization from "../model/authorization/coaSeatReservation";
import PushNotificationQueue from "../model/queue/pushNotification";
import EmailNotification from "../model/notification/email";
import SettleAuthorizationQueue from "../model/queue/settleAuthorization";
import CancelAuthorizationQueue from "../model/queue/cancelAuthorization";

/**
 * キューリポジトリ
 * 
 * @interface QueueRepository
 */
interface QueueRepository {
    /**
     * 検索
     * 
     * @param {Object} conditions
     */
    find(conditions: Object): Promise<Array<Queue>>;
    /**
     * ID検索
     * 
     * @param {ObjectId} id
     */
    findById(id: ObjectId): Promise<monapt.Option<Queue>>;
    /**
     * ひとつ検索&更新
     * 
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Queue>>;
    /**
     * メール送信キューをひとつ検索&更新
     * 
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneSendEmailAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<PushNotificationQueue<EmailNotification>>>;
    /**
     * GMOオーソリ実売上キューをひとつ検索
     * 
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneSettleGMOAuthorizationAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<SettleAuthorizationQueue<GMOAuthorization>>>;
    /**
     * GMOオーソリ取消キューをひとつ検索
     * 
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneCancelGMOAuthorizationAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<CancelAuthorizationQueue<GMOAuthorization>>>;
    /**
     * COA座席本予約キューをひとつ検索
     * 
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<SettleAuthorizationQueue<COASeatReservationAuthorization>>>;
    /**
     * COA座席仮予約削除キューをひとつ検索
     * 
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneCancelCOASeatReservationAuthorizationAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<CancelAuthorizationQueue<COASeatReservationAuthorization>>>;
    /**
     * 保管する
     * 
     * @param {Queue} queue
     */
    store(queue: Queue): Promise<void>;
}

export default QueueRepository;