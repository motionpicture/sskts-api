import * as Authorization from "../model/authorization";
import Transaction from "../model/transaction";
// import TransactionEvent from "../model/TransactionEvent";
import OwnerRepository from "../repository/owner";
import TransactionRepository from "../repository/transaction";
type TransactionOperation<T> = (repository: TransactionRepository) => Promise<T>;

// 取引サービス
interface TransactionService {
    /** 取引開始 */
    start(expired_at: Date, ownerIds: Array<string>): (ownerRepository: OwnerRepository, transactionRepository: TransactionRepository) => Promise<Transaction>;
    /** 内部資産承認 */
    addAssetAuthorization(id: string, authorization: Authorization.ASSET): TransactionOperation<void>;
    /** GMO資産承認 */
    addGMOAuthorization(args: {
        transaction_id: string,
        transaction_password: string,
        owner_id: string,
        gmo_shop_id: string,
        gmo_shop_password: string,
        gmo_order_id: string,
        gmo_amount: string,
        gmo_access_id: string,
        gmo_access_password: string,
        gmo_job_cd: string,
        gmo_pay_type: string,

    }): TransactionOperation<Authorization.GMO>;
    /** COA資産承認 */
    addCOAAuthorization(args: {
        transaction_id: string,
        transaction_password: string,
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
    }): TransactionOperation<Authorization.COA>;
    /** 資産承認解除 */
    removeAuthorization(args: {
        transaction_id: string,
        transaction_password: string,
        authorization_id: string,
    }): TransactionOperation<void>;
    /** 取引成立 */
    close(id: string): TransactionOperation<void>;
    /** 取引期限切れ */
    expire(id: string): TransactionOperation<void>;
    /** 取引取消 */
    cancel(id: string): TransactionOperation<void>;
}

export default TransactionService;