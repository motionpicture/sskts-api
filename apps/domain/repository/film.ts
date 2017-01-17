import monapt = require("monapt");
import Film from "../model/Film";
import Theater from "../model/Theater";
import COA = require("@motionpicture/coa-service");

interface FilmRepository {
    findById(id: string): Promise<monapt.Option<Film>>;
    store(film: Film): Promise<void>;
    storeFromCOA(filmByCOA: COA.findFilmsByTheaterCodeInterface.Result): (theater: Theater) => Promise<void>;
}

export default FilmRepository;