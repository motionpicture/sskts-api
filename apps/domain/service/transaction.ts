import Authorization from "../model/Authorization";
import Transaction from "../model/Transaction";
import TransactionRepository from "../repository/transaction";
type TransactionOperation<T> = (repository: TransactionRepository) => Promise<T>;

// 取引サービス
interface TransactionService {
    /** 取引開始 */
    start(expired_at: Date): TransactionOperation<Transaction>;
    /** 承認アイテム追加 */
    addAuthorization(authorization: Authorization): TransactionOperation<Transaction>;
    /** 取引成立 */
    close(id: string): TransactionOperation<void>;
    /** 取引期限切れ */
    expire(id: string): TransactionOperation<void>;
    /** 取引取消 */
    cancel(id: string): TransactionOperation<void>;
}

export default TransactionService;