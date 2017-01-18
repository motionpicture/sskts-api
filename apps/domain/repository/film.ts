import monapt = require("monapt");
import Film from "../model/film";
import Theater from "../model/theater";
import COA = require("@motionpicture/coa-service");

interface FilmRepository {
    findById(id: string): Promise<monapt.Option<Film>>;
    store(film: Film): Promise<void>;
    storeFromCOA(filmByCOA: COA.findFilmsByTheaterCodeInterface.Result): (theater: Theater) => Promise<void>;
}

export default FilmRepository;