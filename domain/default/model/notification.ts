import ObjectId from "./objectId";

/**
 * 通知
 * 
 * @export
 * @class Notification
 */
export default class Notification {
    /**
     * Creates an instance of Notification.
     * 
     * @param {ObjectId} _id
     * @param {string} group 通知グループ
     */
    constructor(
        readonly _id: ObjectId,
        readonly group: string,
    ) {
        // TODO validation
    }
}