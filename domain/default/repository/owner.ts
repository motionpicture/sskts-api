import monapt = require("monapt");
import ObjectId from "../model/objectId";
import Owner from "../model/owner";
import PromoterOwner from "../model/owner/promoter";

interface OwnerRepository {
    find(conditions: Object): Promise<Array<Owner>>;
    findById(id: ObjectId): Promise<monapt.Option<Owner>>;
    findPromoter(): Promise<monapt.Option<PromoterOwner>>;
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Owner>>;
    store(owner: Owner): Promise<void>;
}

export default OwnerRepository;