import monapt = require("monapt");
import Transaction from "../model/transaction";
import ObjectId from "../model/objectId";

interface TransactionRepository {
    find(conditions: Object): Promise<Array<Transaction>>;
    findById(id: ObjectId): Promise<monapt.Option<Transaction>>;
    findOne(conditions: Object): Promise<monapt.Option<Transaction>>;
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Transaction>>;
    store(transaction: Transaction): Promise<void>;
}

export default TransactionRepository;