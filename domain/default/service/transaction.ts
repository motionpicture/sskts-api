import monapt = require("monapt");
import Authorization from "../model/authorization";
import Notification from "../model/notification";
import Transaction from "../model/transaction";

import OwnerRepository from "../repository/owner";
import TransactionRepository from "../repository/transaction";
import QueueRepository from "../repository/queue";

type TransactionAndQueueOperation<T> = (transastionRepository: TransactionRepository, queueRepository: QueueRepository) => Promise<T>;
type OwnerAndTransactionOperation<T> = (ownerRepository: OwnerRepository, transactionRepository: TransactionRepository) => Promise<T>;
type TransactionOperation<T> = (repository: TransactionRepository) => Promise<T>;

/**
 * 取引サービス
 * 主に、取引中(購入プロセス中)に使用されるファンクション群
 * 
 * @interface TransactionService
 */
interface TransactionService {
    /** 匿名所有者の情報を更新する */
    updateAnonymousOwner(args: {
        /** 取引ID */
        transaction_id: string,
        /** 名 */
        name_first?: string,
        /** 姓 */
        name_last?: string,
        /** メールアドレス */
        email?: string,
        /** 電話番号 */
        tel?: string,
    }): OwnerAndTransactionOperation<void>;
    /** 取引詳細取得 */
    findById(args: {
        /** 取引ID */
        transaction_id: string,
    }): TransactionOperation<monapt.Option<Transaction>>;
    /** 取引開始 */
    start(args: {
        /** 期限日時 */
        expired_at: Date,
    }): OwnerAndTransactionOperation<Transaction>;
    /** GMOオーソリを追加する */
    addGMOAuthorization(args: {
        /** 取引ID */
        transaction_id: string,
        /** 所有者ID(from) */
        owner_id_from: string,
        /** 所有者ID(to) */
        owner_id_to: string,
        /** GMOショップID */
        gmo_shop_id: string,
        /** GMOショップパス */
        gmo_shop_pass: string,
        /** GMOオーダーID */
        gmo_order_id: string,
        /** GMO金額 */
        gmo_amount: number,
        /** GMOアクセスID */
        gmo_access_id: string,
        /** GMOアクセスパス */
        gmo_access_pass: string,
        /** GMOジョブコード */
        gmo_job_cd: string,
        /** GMO決済方法 */
        gmo_pay_type: string,
    }): OwnerAndTransactionOperation<Authorization>;
    /** COA仮予約を追加する */
    addCOASeatReservationAuthorization(args: {
        /** 取引ID */
        transaction_id: string,
        /** 所有者ID(from) */
        owner_id_from: string,
        /** 所有者ID(to) */
        owner_id_to: string,
        /** COA仮予約番号 */
        coa_tmp_reserve_num: number,
        /** COA劇場コード */
        coa_theater_code: string,
        /** COA上映日 */
        coa_date_jouei: string,
        /** COA作品コード */
        coa_title_code: string,
        /** COA作品枝番 */
        coa_title_branch_num: string,
        /** COA上映時刻 */
        coa_time_begin: string,
        /** COAスクリーンコード */
        coa_screen_code: string,
        /** 価格 */
        price: number,
        /** 座席リスト */
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
    /** オーソリアイテムを削除する */
    removeAuthorization(args: {
        /** 取引ID */
        transaction_id: string,
        /** オーソリID */
        authorization_id: string,
    }): TransactionOperation<void>;
    /** 照会を可能にする */
    enableInquiry(args: {
        /** 取引ID */
        transaction_id: string,
        /** 照会用の劇場コード */
        inquiry_theater: string,
        /** 照会ID(今回は購入番号) */
        inquiry_id: string,
        /** 照会パス(今回は電話番号) */
        inquiry_pass: string,
    }): TransactionOperation<void>;
    /** 照会する */
    makeInquiry(args: {
        /** 照会用の劇場コード */
        inquiry_theater: string,
        /** 照会ID(今回は購入番号) */
        inquiry_id: string,
        /** 照会パス(今回は電話番号) */
        inquiry_pass: string,
    }): TransactionOperation<monapt.Option<Transaction>>;
    /** 取引成立後に送信されるメールを追加する */
    addEmail(args: {
        /** 取引ID */
        transaction_id: string,
        /** メールfrom */
        from: string,
        /** メールto */
        to: string,
        /** メール件名 */
        subject: string,
        /** メール本文 */
        content: string,
    }): TransactionOperation<Notification>;
    /** 取引成立後に送信されるメールを削除する */
    removeEmail(args: {
        /** 取引ID */
        transaction_id: string,
        /** 通知ID */
        notification_id: string,
    }): TransactionOperation<void>;
    /** 取引成立 */
    close(args: {
        /** 取引ID */
        transaction_id: string,
    }): TransactionOperation<void>;
    /** 取引期限切れ */
    expireOne(): TransactionOperation<void>;
    /** 取引に関するキュー(非同期で実行されるべき処理)を出力する */
    exportQueues(args: {
        /** 取引ID */
        transaction_id: string,
    }): TransactionAndQueueOperation<void>;
}

export default TransactionService;