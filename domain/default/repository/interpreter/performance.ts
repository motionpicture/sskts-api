import mongoose = require("mongoose");
import monapt = require("monapt");
import Performance from "../../model/performance";
import PerformanceRepository from "../performance";
import PerformanceModel from "./mongoose/model/performance";

class PerformanceRepositoryInterpreter implements PerformanceRepository {
    public connection: mongoose.Connection;

    async find(conditions: Object) {
        let model = this.connection.model(PerformanceModel.modelName, PerformanceModel.schema);
        return <Array<Performance>> await model.find(conditions)
            .populate("film")
            .populate("theater")
            .populate("screen")
            .lean()
            .exec();
    }

    async findById(id: string) {
        let model = this.connection.model(PerformanceModel.modelName, PerformanceModel.schema);
        let performance = <Performance> await model.findOne({ _id: id })
            .populate("film")
            .populate("theater")
            .populate("screen")
            .lean()
            .exec();

        return (performance) ? monapt.Option(performance) : monapt.None;
    }

    async store(performance: Performance) {
        let model = this.connection.model(PerformanceModel.modelName, PerformanceModel.schema);
        await model.findOneAndUpdate({ _id: performance._id }, performance, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}

let repo = new PerformanceRepositoryInterpreter();

export default (connection: mongoose.Connection) => {
    repo.connection = connection;
    return repo;
}