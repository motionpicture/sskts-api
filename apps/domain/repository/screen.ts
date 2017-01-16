import monapt = require("monapt");
import Screen from "../model/Screen";

interface ScreenRepository {
    findById(id: string): Promise<monapt.Option<Screen>>;
    findByTheater(theaterCode: string): Promise<Array<Screen>>;
    store(screen: Screen): Promise<void>;
}

export default ScreenRepository;