import monapt = require("monapt");
import AdministratorOwner from "../../model/owner/administrator";

interface AdministratorOwnerRepository {
    findOne(): Promise<monapt.Option<AdministratorOwner>>;
}

export default AdministratorOwnerRepository;