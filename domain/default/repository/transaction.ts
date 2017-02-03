import monapt = require("monapt");
import Transaction from "../model/transaction";
import ObjectId from "../model/objectId";

/**
 * 取引リポジトリ
 * 
 * @interface TransactionRepository
 */
interface TransactionRepository {
    /**
     * 検索
     * 
     * @param {Object} conditions 検索条件
     */
    find(conditions: Object): Promise<Array<Transaction>>;
    /**
     * ID検索
     * 
     * @param {ObjectId} id
     */
    findById(id: ObjectId): Promise<monapt.Option<Transaction>>;
    /**
     * ひとつ検索
     * 
     * @param {Object} conditions 検索条件
     */
    findOne(conditions: Object): Promise<monapt.Option<Transaction>>;
    /**
     * ひとつ検索&更新
     * 
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Transaction>>;
    /**
     * 保管する
     * 
     * @param {Transaction} transaction 取引
     */
    store(transaction: Transaction): Promise<void>;
}

export default TransactionRepository;