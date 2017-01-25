import monapt = require("monapt");
import Theater from "../model/theater";

interface TheaterRepository {
    findById(id: string): Promise<monapt.Option<Theater>>;
    store(theater: Theater): Promise<void>;
}

export default TheaterRepository;