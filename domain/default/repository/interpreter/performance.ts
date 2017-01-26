import mongoose = require("mongoose");
import monapt = require("monapt");
import Performance from "../../model/performance";
import PerformanceRepository from "../performance";
import * as PerformanceFactory from "../../factory/performance";
import PerformanceModel from "./mongoose/model/performance";

class PerformanceRepositoryInterpreter implements PerformanceRepository {
    public connection: mongoose.Connection;

    async find(conditions: Object) {
        let model = this.connection.model(PerformanceModel.modelName, PerformanceModel.schema);
        let performances = await model.find(conditions)
            .populate("film")
            .populate("theater")
            .populate("screen")
            .exec();

        return performances.map((performance) => {
            return PerformanceFactory.create({
                _id: performance.get("_id"),
                theater: performance.get("theater"),
                screen: performance.get("screen"),
                film: performance.get("film"),
                day: performance.get("day"),
                time_start: performance.get("time_start"),
                time_end: performance.get("time_end"),
                canceled: performance.get("canceled"),
            });
        });
    }

    async findById(id: string) {
        let model = this.connection.model(PerformanceModel.modelName, PerformanceModel.schema);
        let doc = await model.findOne({ _id: id })
            .populate("film")
            .populate("theater")
            .populate("screen")
            .exec();
        if (!doc) return monapt.None;

        let performance = PerformanceFactory.create({
            _id: doc.get("_id"),
            theater: doc.get("theater"),
            screen: doc.get("screen"),
            film: doc.get("film"),
            day: doc.get("day"),
            time_start: doc.get("time_start"),
            time_end: doc.get("time_end"),
            canceled: doc.get("canceled"),
        });

        return monapt.Option(performance);
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