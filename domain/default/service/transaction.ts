import AssetAuthorization from "../model/authorization/asset";
import monapt = require("monapt");
import Authorization from "../model/authorization";
import Email from "../model/email";
import Transaction from "../model/transaction";
import AnonymousOwner from "../model/owner/anonymous";
import AdministratorOwner from "../model/owner/administrator";

import OwnerRepository from "../repository/owner";
import TransactionRepository from "../repository/transaction";
import AssetAuthorizationRepository from "../repository/authorization/asset";
import QueueRepository from "../repository/queue";
import AssetRepository from "../repository/asset";
import AdministratorOwnerRepository from "../repository/owner/administrator";

type TransactionAndQueueOperation<T> = (transastionRepository: TransactionRepository, queueRepository: QueueRepository) => Promise<T>;
type OwnerAndTransactionOperation<T> = (ownerRepository: OwnerRepository, transactionRepository: TransactionRepository) => Promise<T>;
type AssetAuthorizationAndTransactionOperation<T> = (assetAuthorizationRepository: AssetAuthorizationRepository, repository: TransactionRepository) => Promise<T>;
type TransactionOperation<T> = (repository: TransactionRepository) => Promise<T>;
type AssetOperation<T> = (assetRepository: AssetRepository) => Promise<T>;
type OwnerOperation<T> = (ownerRepository: OwnerRepository) => Promise<T>;
type AdministratorOwnerOperation<T> = (administratorOwnerRepository: AdministratorOwnerRepository) => Promise<T>;

/**
 * 取引サービス
 */
interface TransactionService {
    /** 匿名所有者を発行する */
    createAnonymousOwner(): OwnerOperation<AnonymousOwner>;
    /** 匿名所有者の情報を更新する */
    updateAnonymousOwner(args: {
        _id: string,
        name_first?: string,
        name_last?: string,
        email?: string,
        tel?: string,
    }): OwnerOperation<void>;
    /** 運営者を取得する */
    getAdministratorOwner(): AdministratorOwnerOperation<AdministratorOwner>;
    /** 取引詳細取得 */
    findById(args: {
        transaction_id: string,
    }): TransactionOperation<monapt.Option<Transaction>>;
    /** 取引開始 */
    start(args: {
        expired_at: Date,
        owner_ids: Array<string>
    }): OwnerAndTransactionOperation<Transaction>;
    /** 資産承認 */
    authorizeAsset(authorization: AssetAuthorization): AssetOperation<void>;
    /** 内部資産承認 */
    addAssetAuthorization(args: {
        transaction_id: string,
        authorization_id: string,
    }): AssetAuthorizationAndTransactionOperation<Authorization>;
    /** GMO資産承認 */
    addGMOAuthorization(args: {
        transaction_id: string,
        owner_id_from: string,
        owner_id_to: string,
        gmo_shop_id: string,
        gmo_shop_pass: string,
        gmo_order_id: string,
        gmo_amount: number,
        gmo_access_id: string,
        gmo_access_pass: string,
        gmo_job_cd: string,
        gmo_pay_type: string,

    }): OwnerAndTransactionOperation<Authorization>;
    /** COA資産承認 */
    addCOASeatReservationAuthorization(args: {
        transaction_id: string,
        owner_id_from: string,
        owner_id_to: string,
        coa_tmp_reserve_num: string,
        price: number,
        seats: Array<{
            performance: string,
            section: string,
            seat_code: string,
            ticket_code: string,
            ticket_name_ja: string,
            ticket_name_en: string,
            ticket_name_kana: string,
            std_price: number,
            add_price: number,
            dis_price: number,
            sale_price: number,
        }>
    }): OwnerAndTransactionOperation<Authorization>;
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
    /** 照会する */
    inquiry(args: {
        inquiry_id: string,
        inquiry_pass: string,
    }): TransactionOperation<monapt.Option<Transaction>>;
    /** メール追加 */
    addEmail(args: {
        transaction_id: string,
        from: string,
        to: string,
        subject: string,
        body: string,
    }): TransactionOperation<Email>;
    /** メール削除 */
    removeEmail(args: {
        transaction_id: string,
        email_id: string,
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
    exportQueues(args: {
        transaction_id?: string,
    }): TransactionAndQueueOperation<void>;
}

export default TransactionService;