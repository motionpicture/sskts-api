// import monapt = require("monapt");
import Asset from "../model/asset";

interface AssetRepository {
    store(asset: Asset): Promise<void>;
}

export default AssetRepository;