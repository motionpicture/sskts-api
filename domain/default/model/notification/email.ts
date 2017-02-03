import validator = require("validator");
import ObjectId from "../objectId";
import Notification from "../notification";
import NotificationGroup from "../notificationGroup";

/**
 * Eメール通知
 * 
 * @export
 * @class EmailNotification
 * @extends {Notification}
 */
export default class EmailNotification extends Notification {
    /**
     * Creates an instance of EmailNotification.
     * 
     * @param {ObjectId} _id
     * @param {string} from
     * @param {string} to
     * @param {string} subject
     * @param {string} content
     * 
     * @memberOf EmailNotification
     */
    constructor(
        readonly _id: ObjectId,
        readonly from: string,
        readonly to: string,
        readonly subject: string,
        readonly content: string,
    ) {
        super(_id, NotificationGroup.EMAIL);

        // TODO validation
        if (validator.isEmpty(from)) throw new Error("from required.");
        if (validator.isEmpty(to)) throw new Error("to required.");
        if (validator.isEmpty(subject)) throw new Error("subject required.");
        if (validator.isEmpty(content)) throw new Error("content required.");
    }
}