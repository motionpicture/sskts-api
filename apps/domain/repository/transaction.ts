import Transaction from "../model/Transaction";
import TransactionEvent from "../model/TransactionEvent";

interface TransactionRepository {
    pushEvent(_id: string, event: TransactionEvent): Promise<void>;
    store(transaction: Transaction): Promise<void>;
}

export default TransactionRepository;