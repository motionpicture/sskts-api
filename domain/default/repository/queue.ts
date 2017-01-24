import monapt = require("monapt");
import Queue from "../model/queue";

interface QueueRepository {
    find(conditions: Object): Promise<Array<Queue>>;
    findById(id: string): Promise<monapt.Option<Queue>>;
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Queue>>;
    store(queue: Queue): Promise<void>;
}

export default QueueRepository;