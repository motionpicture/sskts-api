export default class Email {
    constructor(
        readonly _id: string,
        readonly from: string,
        readonly to: string,
        readonly subject: string,
        readonly body: string,
    ) {
        // TODO validation
    }
}