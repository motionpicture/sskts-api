import * as Authorization from "../model/Authorization";
import Transaction from "../model/Transaction";
// import TransactionEvent from "../model/TransactionEvent";
import OwnerRepository from "../repository/owner";
import TransactionRepository from "../repository/transaction";
type TransactionOperation<T> = (repository: TransactionRepository) => Promise<T>;

// 取引サービス
interface TransactionService {
    /** 取引開始 */
    start(expired_at: Date, ownerIds: Array<string>): (ownerRepository: OwnerRepository, transactionRepository: TransactionRepository) => Promise<Transaction>;
    /** 内部資産承認 */
    addAssetAuthorization(id: string, authorization: Authorization.ASSET): TransactionOperation<void>;
    /** GMO資産承認 */
    addGMOAuthorization(id: string, authorization: Authorization.GMO): TransactionOperation<void>;
    /** COA資産承認 */
    addCOAAuthorization(id: string, authorization: Authorization.COA): TransactionOperation<void>;
    /** 資産承認解除 */
    // unauthorizeAsset(id: string): AssetAndTransactionOperation<void>;
    /** 取引成立 */
    close(id: string): TransactionOperation<void>;
    /** 取引期限切れ */
    expire(id: string): TransactionOperation<void>;
    /** 取引取消 */
    cancel(id: string): TransactionOperation<void>;
}

export default TransactionService;