import Theater from "./Theater";
import MultilingualString from "./MultilingualString";
interface Seat {
    code: string
}
interface Section {
    code: string,
    name: MultilingualString,
    seats: Array<Seat>
}

export default class Screen {
    constructor(
        readonly _id: string,
        readonly theater: Theater,
        readonly coa_screen_code: string,
        readonly name: MultilingualString,
        readonly sections: Array<Section>
    ) {
        // TODO validation
    }
}