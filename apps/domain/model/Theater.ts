import MultilingualString from "./MultilingualString";

interface Theater {
    _id: string,
    name: MultilingualString,
    name_kana: string,
    address: MultilingualString
}

export default Theater;