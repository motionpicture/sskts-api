import monapt = require("monapt");
import Theater from "../model/theater";
import Screen from "../model/screen";
import COA = require("@motionpicture/coa-service");

interface ScreenRepository {
    findById(id: string): Promise<monapt.Option<Screen>>;
    findByTheater(theaterCode: string): Promise<Array<Screen>>;
    store(screen: Screen): Promise<void>;
    storeFromCOA(screenByCOA: COA.findScreensByTheaterCodeInterface.Result): (theater: Theater) => Promise<void>;
}

export default ScreenRepository;