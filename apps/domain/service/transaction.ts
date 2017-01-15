import Asset from "../model/Asset";
import Authorization from "../model/Authorization";
import Transaction from "../model/Transaction";
import AssetRepository from "../repository/asset";
import TransactionRepository from "../repository/transaction";
type TransactionOperation<T> = (repository: TransactionRepository) => Promise<T>;
type AssetAndTransactionOperation<T> = (assetRepository: AssetRepository, transactionRepository: TransactionRepository) => Promise<T>;

// 取引サービス
interface TransactionService {
    /** 取引開始 */
    start(expired_at: Date): TransactionOperation<Transaction>;
    /** 資産承認 */
    authorizeAsset(asset: Asset): AssetAndTransactionOperation<Authorization>;
    /** 資産承認解除 */
    unauthorizeAsset(id: string): AssetAndTransactionOperation<void>;
    /** 取引成立 */
    close(id: string): TransactionOperation<void>;
    /** 取引期限切れ */
    expire(id: string): TransactionOperation<void>;
    /** 取引取消 */
    cancel(id: string): TransactionOperation<void>;
}

export default TransactionService;