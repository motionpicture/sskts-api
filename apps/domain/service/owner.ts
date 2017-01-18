import AnonymousOwner from "../model/owner/anonymous";
import AnonymousOwnerRepository from "../repository/owner/anonymous";

// 所有者サービス
interface OwnerService {
    createAnonymous(): (repository: AnonymousOwnerRepository) => Promise<AnonymousOwner>;
}

export default OwnerService;