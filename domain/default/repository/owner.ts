import monapt = require("monapt");
import ObjectId from "../model/objectId";
import Owner from "../model/owner";
import PromoterOwner from "../model/owner/promoter";

/**
 * 所有者リポジトリ
 * 
 * @interface OwnerRepository
 */
interface OwnerRepository {
    /**
     * 検索
     * 
     * @param {Object} conditions 検索条件
     */
    find(conditions: Object): Promise<Array<Owner>>;
    /**
     * ID検索
     * 
     * @param {ObjectId} id
     */
    findById(id: ObjectId): Promise<monapt.Option<Owner>>;
    /**
     * 興行所有者を検索
     */
    findPromoter(): Promise<monapt.Option<PromoterOwner>>;
    /**
     * ひとつ検索&更新
     * 
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Owner>>;
    /**
     * 保管する
     * 
     * @param {Owner} owner 所有者
     */
    store(owner: Owner): Promise<void>;
}

export default OwnerRepository;