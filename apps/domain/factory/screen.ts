import * as Screen from "../model/screen";
import Theater from "../model/theater";
import MultilingualString from "../model/multilingualString";

export function create(args: {
    _id: string,
    theater: Theater,
    coa_screen_code: string,
    name: MultilingualString,
    sections: Array<Screen.Section>
}) {
    return new Screen.default(
        args._id,
        args.theater,
        args.coa_screen_code,
        args.name,
        args.sections,
    )
};