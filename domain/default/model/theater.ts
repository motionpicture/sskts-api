import MultilingualString from "./multilingualString";

/**
 * 劇場
 * 
 * @export
 * @class Theater
 */
export default class Theater {
    /**
     * Creates an instance of Theater.
     * 
     * @param {string} _id
     * @param {MultilingualString} name 劇場名称
     * @param {string} name_kana 劇場名称(カナ)
     * @param {MultilingualString} address 劇場住所
     * 
     * @memberOf Theater
     */
    constructor(
        readonly _id: string,
        readonly name: MultilingualString,
        readonly name_kana: string,
        readonly address: MultilingualString
    ) {
        // TODO validation
    }
}