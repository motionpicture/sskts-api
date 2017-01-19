import AssetAuthorization from "../model/authorization/asset";
import GMOAuthorization from "../model/authorization/gmo";
import COAAuthorization from "../model/authorization/coa";
import Transaction from "../model/transaction";
// import TransactionEvent from "../model/TransactionEvent";
import OwnerRepository from "../repository/owner";
import TransactionRepository from "../repository/transaction";
import AssetAuthorizationRepository from "../repository/authorization/asset";
type OwnerAndTransactionOperation<T> = (ownerRepository: OwnerRepository, transactionRepository: TransactionRepository) => Promise<T>;
type AssetAuthorizationAndTransactionOperation<T> = (assetAuthorizationRepository: AssetAuthorizationRepository, repository: TransactionRepository) => Promise<T>;
type TransactionOperation<T> = (repository: TransactionRepository) => Promise<T>;

// 取引サービス
interface TransactionService {
    /** 取引開始 */
    start(args: {
        expired_at: Date,
        owner_ids: Array<string>
    }): OwnerAndTransactionOperation<Transaction>;
    /** 内部資産承認 */
    addAssetAuthorization(args: {
        transaction_id: string,
        authorization_id: string,
    }): AssetAuthorizationAndTransactionOperation<AssetAuthorization>;
    /** GMO資産承認 */
    addGMOAuthorization(args: {
        transaction_id: string,
        owner_id: string,
        gmo_shop_id: string,
        gmo_shop_password: string,
        gmo_order_id: string,
        gmo_amount: string,
        gmo_access_id: string,
        gmo_access_password: string,
        gmo_job_cd: string,
        gmo_pay_type: string,

    }): TransactionOperation<GMOAuthorization>;
    /** COA資産承認 */
    addCOAAuthorization(args: {
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
        // price: number,
    }): TransactionOperation<COAAuthorization>;
    /** 資産承認解除 */
    removeAuthorization(args: {
        transaction_id: string,
        authorization_id: string,
    }): TransactionOperation<void>;
    /** 照合を可能にする */
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
}

export default TransactionService;