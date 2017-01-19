import monapt = require("monapt");
import AnonymousOwner from "../../model/owner/anonymous";
import OwnerRepository from "../owner";

interface AnonymousOwnerRepository extends OwnerRepository {
    find(conditions: Object): Promise<Array<AnonymousOwner>>;
    findById(id: string): Promise<monapt.Option<AnonymousOwner>>;
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<AnonymousOwner>>;
    store(owner: AnonymousOwner): Promise<void>;
}

export default AnonymousOwnerRepository;