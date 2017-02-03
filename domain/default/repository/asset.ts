import Asset from "../model/asset";

/**
 * 資産リポジトリ
 * 
 * @interface AssetRepository
 */
interface AssetRepository {
    /**
     * 保管する
     * 
     * @param {Asset} asset 資産
     */
    store(asset: Asset): Promise<void>;
}

export default AssetRepository;