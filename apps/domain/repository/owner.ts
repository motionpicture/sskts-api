import monapt = require("monapt");
import {default as Owner} from "../model/owner";

interface OwnerRepository {
    find(conditions: Object): Promise<Array<Owner>>;
    findById(id: string): Promise<monapt.Option<Owner>>;
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Owner>>;
    store(owner: Owner): Promise<void>;
}

export default OwnerRepository;