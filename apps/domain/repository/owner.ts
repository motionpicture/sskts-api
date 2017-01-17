import monapt = require("monapt");
import {default as Owner} from "../model/Owner";

interface OwnerRepository {
    find(conditions: Object): Promise<Array<Owner>>;
    findById<T>(id: string): Promise<monapt.Option<T>>;
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Owner>>;
    store(owner: Owner): Promise<void>;
}

export default OwnerRepository;