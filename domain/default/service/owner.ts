import AnonymousOwner from "../model/owner/anonymous";
import AdministratorOwner from "../model/owner/administrator";
import OwnerRepository from "../repository/owner";
import AdministratorOwnerRepository from "../repository/owner/administrator";
type OwnerOperation<T> = (ownerRepository: OwnerRepository) => Promise<T>;
type AdministratorOwnerOperation<T> = (administratorOwnerRepository: AdministratorOwnerRepository) => Promise<T>;

/**
 * 所有者関連サービス
 */
interface OwnerService {
    /** 匿名所有者を発行する */
    createAnonymous(): OwnerOperation<AnonymousOwner>;
    /** 匿名所有者の情報を更新する */
    updateAnonymous(args: {
        _id: string,
        name_first?: string,
        name_last?: string,
        email?: string,
        tel?: string,
    }): OwnerOperation<void>;
    /** 運営者を取得する */
    getAdministrator(): AdministratorOwnerOperation<AdministratorOwner>;
}

export default OwnerService;