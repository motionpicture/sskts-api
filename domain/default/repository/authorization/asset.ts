import monapt = require("monapt");
import AssetAuthorization from "../../model/authorization/asset";
import AuthorizationRepository from "../authorization";

interface AssetAuthorizationRepository extends AuthorizationRepository {
    find(conditions: Object): Promise<Array<AssetAuthorization>>;
    findById(id: string): Promise<monapt.Option<AssetAuthorization>>;
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<AssetAuthorization>>;
    store(authorization: AssetAuthorization): Promise<void>;
}

export default AssetAuthorizationRepository;