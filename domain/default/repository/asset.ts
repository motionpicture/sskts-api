interface AssetRepository {
    updateAuthority(): Promise<void>;
}

export default AssetRepository;