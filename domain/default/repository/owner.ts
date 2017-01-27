import monapt = require("monapt");
import ObjectId from "../model/objectId";
import Owner from "../model/owner";
import AdministratorOwner from "../model/owner/administrator";

interface OwnerRepository {
    find(conditions: Object): Promise<Array<Owner>>;
    findById(id: ObjectId): Promise<monapt.Option<Owner>>;
    findAdministrator(): Promise<monapt.Option<AdministratorOwner>>;
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Owner>>;
    store(owner: Owner): Promise<void>;
}

export default OwnerRepository;