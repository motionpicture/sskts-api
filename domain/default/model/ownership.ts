import ObjectId from "./objectId";
import Owner from "./owner";

/**
 * 所有権
 * 誰が、何を、所有するのか
 */
export default class Ownership {
    constructor(
        /** 所有権ID */
        readonly _id: ObjectId,
        /** 所有者 */
        readonly owner: Owner,
        /** 認証済みかどうか */
        readonly authenticated: boolean,
    ) {
        // TODO validation
    }
}