import MultilingualString from "./MultilingualString";

interface Screen {
    _id: string,
    theater: string,
    coa_screen_code: string,
    name: MultilingualString,
    sections: Array<{
        code: string,
        name: MultilingualString,
        seats: Array<{
            code: string
        }>
    }>
}

export default Screen;