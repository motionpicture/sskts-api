import monapt = require("monapt");
import Screen from "../model/screen";

/**
 * スクリーンリポジトリ
 * 
 * @interface ScreenRepository
 */
interface ScreenRepository {
    /**
     * ID検索
     * 
     * @param {string} id
     */
    findById(id: string): Promise<monapt.Option<Screen>>;
    /**
     * 劇場で検索
     */
    findByTheater(args: {
        /** 劇場ID */
        theater_id: string
    }): Promise<Array<Screen>>;
    /**
     * 保管する
     * 
     * @param {Screen} screen スクリーン
     */
    store(screen: Screen): Promise<void>;
}

export default ScreenRepository;