import monapt = require("monapt");
import Authorization from "../model/authorization";
import Transaction from "../model/transaction";
import OwnerRepository from "../repository/owner";
import TransactionRepository from "../repository/transaction";
import AssetAuthorizationRepository from "../repository/authorization/asset";
import QueueRepository from "../repository/queue";
type TransactionAndQueueOperation<T> = (transastionRepository: TransactionRepository, queueRepository: QueueRepository) => Promise<T>;
type OwnerAndTransactionOperation<T> = (ownerRepository: OwnerRepository, transactionRepository: TransactionRepository) => Promise<T>;
type AssetAuthorizationAndTransactionOperation<T> = (assetAuthorizationRepository: AssetAuthorizationRepository, repository: TransactionRepository) => Promise<T>;
type TransactionOperation<T> = (repository: TransactionRepository) => Promise<T>;

/**
 * 取引関連サービス
 */
interface TransactionService {
    /** 取引詳細取得 */
    getDetails(args: {
        transaction_id: string,
    }): TransactionOperation<monapt.Option<Transaction>>;
    /** 取引開始 */
    start(args: {
        expired_at: Date,
        owner_ids: Array<string>
    }): OwnerAndTransactionOperation<Transaction>;
    /** 内部資産承認 */
    addAssetAuthorization(args: {
        transaction_id: string,
        authorization_id: string,
    }): AssetAuthorizationAndTransactionOperation<Authorization>;
    /** GMO資産承認 */
    addGMOAuthorization(args: { // TODO shopとorder_idでユニークになるはず
        transaction_id: string,
        owner_id: string,
        gmo_shop_id: string,
        gmo_shop_pass: string,
        gmo_order_id: string,
        gmo_amount: string,
        gmo_access_id: string,
        gmo_access_pass: string,
        gmo_job_cd: string,
        gmo_pay_type: string,

    }): TransactionOperation<Authorization>;
    /** COA資産承認 */
    addCOASeatReservationAuthorization(args: { // TODO theaterとtmp_reserve_numでユニークになるはず
        transaction_id: string,
        owner_id: string,
        coa_tmp_reserve_num: string,
        seats: Array<{
            performance: string,
            section: string,
            seat_code: string,
            ticket_code: string,
            // ticket_name_ja: string,
            // ticket_name_en: string,
            // ticket_name_kana: string,
            // std_price: number,
            // add_price: number,
            // dis_price: number,
        }>
        // price: number, // TODO 必須
    }): TransactionOperation<Authorization>;
    /** 資産承認解除 */
    removeAuthorization(args: {
        transaction_id: string,
        authorization_id: string,
    }): TransactionOperation<void>;
    /** 照会を可能にする */
    enableInquiry(args: {
        transaction_id: string,
        inquiry_id: string,
        inquiry_pass: string,
    }): TransactionOperation<void>;
    /** 取引成立 */
    close(args: {
        transaction_id: string,
    }): TransactionOperation<void>;
    /** 取引期限切れ */
    expire(args: {
        transaction_id: string,
    }): TransactionOperation<void>;
    /** 取引取消 */
    cancel(args: {
        transaction_id: string,
    }): TransactionOperation<void>;
    /** キューを出力する */
    enqueue(args: {
        transaction_id?: string,
    }): TransactionAndQueueOperation<void>;
}

export default TransactionService;