import {Anonymous as AnonymousOwner} from "../model/Owner";
import AnonymousOwnerRepository from "../repository/owner/anonymous";

// 所有者サービス
interface OwnerService {
    createAnonymous(): (repository: AnonymousOwnerRepository) => Promise<AnonymousOwner>;
}

export default OwnerService;