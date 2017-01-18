import monapt = require("monapt");
import Transaction from "../model/Transaction";

interface TransactionRepository {
    find(conditions: Object): Promise<Array<Transaction>>;
    findById(id: string): Promise<monapt.Option<Transaction>>;
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Transaction>>;
    store(transaction: Transaction): Promise<void>;
}

export default TransactionRepository;