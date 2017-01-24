import MultilingualString from "./multilingualString";

export default class Theater {
    constructor(
        readonly _id: string,
        readonly name: MultilingualString,
        readonly name_kana: string,
        readonly address: MultilingualString
    ) {
        // TODO validation
    }
}