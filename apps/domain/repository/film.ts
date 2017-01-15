import Film from "../model/Film";

interface FilmRepository {
    findById(id: string): Promise<Film>;
    store(film: Film): Promise<void>;
}

export default FilmRepository;