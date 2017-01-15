import Film from "../model/Film";

interface FilmRepository {
    find(id: string): Promise<Film>;
    store(film: Film): Promise<void>;
}

export default FilmRepository;