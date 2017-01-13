import Transaction from "../model/Transaction";
import TransactionRepository from "../repository/transaction";
type TransactionOperation<T> = (repository: TransactionRepository) => Promise<T>;

// 取引サービス
interface TransactionService {
    start(expired_at: Date): TransactionOperation<Transaction>;
    close(id: string): TransactionOperation<void>;
    expire(id: string): TransactionOperation<void>;
    cancel(id: string): TransactionOperation<void>;
}

export default TransactionService;