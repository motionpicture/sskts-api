import Asset from "../model/Asset";
import Authorization from "../model/Authorization";
import AssetRepository from "../repository/asset";
type AssetOperation<T> = (assetRepository: AssetRepository) => Promise<T>;

// 資産サービス
interface AssetService {
    // AssetはAssetFactoryのcreateで拡張可能
    authorize(asset: Asset): AssetOperation<Authorization>;
    unauthorize(id: string): AssetOperation<void>;
}

export default AssetService;