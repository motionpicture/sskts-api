import monapt = require("monapt");
import Authorization from "../model/authorization";

interface AuthorizationRepository {
    find(conditions: Object): Promise<Array<Authorization>>;
    findById(id: string): Promise<monapt.Option<Authorization>>;
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Authorization>>;
    store(authorization: Authorization): Promise<void>;
}

export default AuthorizationRepository;