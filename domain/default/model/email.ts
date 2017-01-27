import ObjectId from "./objectId";

export default class Email {
    constructor(
        readonly _id: ObjectId,
        readonly from: string,
        readonly to: string,
        readonly subject: string,
        readonly body: string,
    ) {
        // TODO validation
    }
}