import AnonymousOwner from "../model/owner/anonymous";
import OwnerRepository from "../repository/owner/anonymous";

// 所有者サービス
interface OwnerService {
    createAnonymous(): (ownerRepository: OwnerRepository) => Promise<AnonymousOwner>;
    updateAnonymous(args: {
        _id: string,
        name_first?: string,
        name_last?: string,
        email?: string,
        tel?: string,
    }): (ownerRepository: OwnerRepository) => Promise<void>;
}

export default OwnerService;