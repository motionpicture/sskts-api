import TransactionRepository from "../repository/transaction";
import QueueRepository from "../repository/queue";
type TransactionAndQueueOperation<T> = (transastionRepository: TransactionRepository, queueRepository: QueueRepository) => Promise<T>;
type QueueOperation<T> = (queueRepository: QueueRepository) => Promise<T>;

/**
 * キューサービス
 */
interface QueueService {
    /** 取引からキューをインポートする */
    importFromTransaction(): TransactionAndQueueOperation<void>;
    /** 資産承認に対して資産移動を行う */
    settleAuthorization(): QueueOperation<void>;
    /** 資産承認を解除する */
    cancelAuthorization(): QueueOperation<void>;
    /** 資産承認を解除する */
    sendEmail(): QueueOperation<void>;
}

export default QueueService;