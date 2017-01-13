import Asset from "../model/Asset";
import Authorization from "../model/Authorization";
import AssetRepository from "../repository/asset";
import TransactionRepository from "../repository/transaction";
type AssetOperation<T> = (assetRepository: AssetRepository, transactionRepository: TransactionRepository) => Promise<T>;

// 資産サービス
interface AssetService {
    authorize(asset: Asset): AssetOperation<Authorization>;
    unauthorize(id: string): AssetOperation<void>;
}

export default AssetService;