import monapt = require("monapt");
import Film from "../model/film";

/**
 * 作品リポジトリ
 * 
 * @interface FilmRepository
 */
interface FilmRepository {
    /**
     * IDで検索
     * 
     * @param {string} id
     */
    findById(id: string): Promise<monapt.Option<Film>>;
    /**
     * 保管する
     * 
     * @param {Film} film
     */
    store(film: Film): Promise<void>;
}

export default FilmRepository;