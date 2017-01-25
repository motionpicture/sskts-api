import monapt = require("monapt");
import Film from "../model/film";

interface FilmRepository {
    findById(id: string): Promise<monapt.Option<Film>>;
    store(film: Film): Promise<void>;
}

export default FilmRepository;