import StockService from "../stock";
import ObjectId from "../../model/objectId";
import AssetAuthorization from "../../model/authorization/asset";
import COASeatReservationAuthorization from "../../model/authorization/coaSeatReservation";
import TransactionStatus from "../../model/transactionStatus";
import AssetRepository from "../../repository/asset";
import TransactionRepository from "../../repository/transaction";
import COA = require("@motionpicture/coa-service");

/**
 * 在庫サービス
 */
class StockServiceInterpreter implements StockService {
    /** 資産承認解除 */
    unauthorizeAsset(authorization: AssetAuthorization) {
        return async (assetRepository: AssetRepository) => {
            console.log(authorization);
            console.log(assetRepository);
            throw new Error("not implemented.");
        }
    }

    /** 資産移動 */
    transferAssset(authorization: AssetAuthorization) {
        return async (assetRepository: AssetRepository) => {
            console.log(authorization);
            console.log(assetRepository);
            throw new Error("not implemented.");
        }
    }

    /** 資産承認解除(COA座席予約) */
    unauthorizeCOASeatReservation(authorization: COASeatReservationAuthorization) {
        return async (coaRepository: typeof COA) => {
            await coaRepository.deleteTmpReserveInterface.call({
                theater_code: authorization.coa_theater_code,
                date_jouei: authorization.coa_date_jouei,
                title_code: authorization.coa_title_code,
                title_branch_num: authorization.coa_title_branch_num,
                time_begin: authorization.coa_time_begin,
                tmp_reserve_num: authorization.coa_tmp_reserve_num,
            });
        }
    }

    /** 資産移動(COA座席予約) */
    transferCOASeatReservation(authorization: COASeatReservationAuthorization) {
        return async (assetRepository: AssetRepository) => {

            // ウェブフロントで事前に本予約済みなので不要
            // await COA.updateReserveInterface.call({
            // });

            let promises = authorization.assets.map(async (asset) => {
                // 資産永続化
                assetRepository.store(asset);
            });

            await Promise.all(promises);
        }
    }

    /**
     * 取引照会を無効にする
     * COAのゴミ購入データを削除する
     */
    disableTransactionInquiry(args: {
        transaction_id: string,
    }) {
        return async (transactionRepository: TransactionRepository, coaRepository: typeof COA) => {
            // 取引取得
            let option = await transactionRepository.findById(ObjectId(args.transaction_id));
            if (option.isEmpty) throw new Error("transaction not found.");

            let tranasction = option.get();

            // COAから内容抽出
            let reservation = await coaRepository.stateReserveInterface.call({
                theater_code: tranasction.inquiry_theater,
                reserve_num: parseInt(tranasction.inquiry_id),
                tel_num: tranasction.inquiry_pass,
            });

            // COA購入チケット取消
            await coaRepository.deleteReserveInterface.call({
                theater_code: tranasction.inquiry_theater,
                reserve_num: parseInt(tranasction.inquiry_id),
                tel_num: tranasction.inquiry_pass,
                date_jouei: reservation.date_jouei,
                title_code: reservation.title_code,
                title_branch_num: reservation.title_branch_num,
                time_begin: reservation.time_begin,
                list_seat: reservation.list_ticket
            });

            // 永続化
            await transactionRepository.findOneAndUpdate(
                {
                    _id: ObjectId(args.transaction_id),
                    status: TransactionStatus.UNDERWAY
                },
                {
                    $set: {
                        inquiry_theater: "",
                        inquiry_id: "",
                        inquiry_pass: "",
                    },
                });
        };
    }
}

export default new StockServiceInterpreter();