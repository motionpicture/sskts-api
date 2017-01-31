import ObjectId from "./objectId";

/**
 * 通知
 */
export default class Notification {
    constructor(
        readonly _id: ObjectId,
        readonly group: string,
    ) {
        // TODO validation
    }
}