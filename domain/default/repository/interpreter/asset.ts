import mongoose = require("mongoose");
// import monapt = require("monapt");
import Asset from "../../model/asset";
import AssetRepository from "../asset";
// import * as FilmFactory from "../../factory/asset";
import AssetModel from "./mongoose/model/asset";

class AssetRepositoryInterpreter implements AssetRepository {
    public connection: mongoose.Connection;

    async store(asset: Asset) {
        let model = this.connection.model(AssetModel.modelName, AssetModel.schema);
        await model.findOneAndUpdate({ _id: asset._id }, asset, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}

let repo = new AssetRepositoryInterpreter();

export default (connection: mongoose.Connection) => {
    repo.connection = connection;
    return repo;
}