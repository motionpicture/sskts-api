import monapt = require("monapt");
import Theater from "../model/theater";
import COA = require("@motionpicture/coa-service");

interface TheaterRepository {
    findById(id: string): Promise<monapt.Option<Theater>>;
    store(theater: Theater): Promise<void>;
    storeFromCOA(theaterByCOA: COA.findTheaterInterface.Result): Promise<void>;
}

export default TheaterRepository;