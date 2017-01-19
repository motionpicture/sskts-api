import TransactionStatus from "../../model/transactionStatus";
import QueueService from "../queue";
import QueueRepository from "../../repository/queue";
import TransactionRepository from "../../repository/transaction";
import * as QueueFactory from "../../factory/queue";
import QueueGroup from "../../model/queueGroup";
import QueueStatus from "../../model/queueStatus";

namespace interpreter {
    /** 取引から資産承認をインポートする */
    export function importFromTransaction() {
        return async (transactionRepository: TransactionRepository, queueRepository: QueueRepository) => {
            // 未インポートの取引を取得
            let option = await transactionRepository.findOneAndUpdate({
                status: { $in: [TransactionStatus.CLOSED, TransactionStatus.EXPIRED] },
                queues_imported: false
            }, {
                    queues_imported: false
                });
            if (option.isEmpty) return;

            let transaction = option.get();
            console.log("transaction is", transaction);

            let promises: Array<Promise<void>> = [];
            switch (transaction.status) {
                case TransactionStatus.CLOSED:
                    // 資産移動キュー作成
                    promises = promises.concat(transaction.authorizations.map(async (authorization) => {
                        let queue = QueueFactory.createSettleAuthorization({
                            status: QueueStatus.UNEXECUTED,
                            authorization: authorization
                        });
                        await queueRepository.store(queue);
                    }));

                    // TODO メール送信キュー作成

                    break;

                case TransactionStatus.EXPIRED:
                    // 承認解除キュー作成
                    // promises = promises.concat(transaction.authorizations.map(async (authorization) => {
                    //     let queue = QueueFactory.createSetttleAuthorization({
                    //         authorization: authorization
                    //     });
                    //     await queueRepository.store(queue);
                    // }));

                    break;
                default:
                    break;
            }

            await Promise.all(promises);
            console.log("queues created.");

            // 承認を全て作成できたら取引のフラグ変更
            await transactionRepository.findOneAndUpdate({
                _id: transaction._id
            }, {
                    queues_imported: true
                });
        }
    }

    /** 資産承認に対して資産移動を行う */
    export function settleAuthorization() {
        return async (queueRepository: QueueRepository) => {
            let option = await queueRepository.findOneAndUpdate({
                status: QueueStatus.UNEXECUTED,
                group: QueueGroup.SETTLE_AUTHORIZATION
            }, { status: QueueStatus.RUNNING });
            if (option.isEmpty) return;

            // TODO 資産移動処理
            let queue = option.get();
            console.log("queue is", queue);

            await queueRepository.findOneAndUpdate({ _id: queue._id }, { status: QueueStatus.EXECUTED });
        }
    }

    /** 資産承認を解除する */
    export function cancelAuthorization() {
        return async (queueRepository: QueueRepository) => {
            let option = await queueRepository.findOneAndUpdate({
                status: QueueStatus.UNEXECUTED,
                group: QueueGroup.CANCEL_AUTHORIZATION
            }, { status: QueueStatus.RUNNING });
            if (option.isEmpty) return;

            // TODO 承認解除処理
            let queue = option.get();
            console.log("queue is", queue);

            await queueRepository.findOneAndUpdate({ _id: queue._id }, { status: QueueStatus.EXECUTED });
        }
    }

    /** メール送信 */
    export function sendEmail() {
        return async (queueRepository: QueueRepository) => {
            let option = await queueRepository.findOneAndUpdate({
                status: QueueStatus.UNEXECUTED,
                group: QueueGroup.SEND_EMAIL
            }, { status: QueueStatus.RUNNING });
            if (option.isEmpty) return;

            // TODO メール処理
            let queue = option.get();
            console.log("queue is", queue);

            await queueRepository.findOneAndUpdate({ _id: queue._id }, { status: QueueStatus.EXECUTED });
        }
    }
}

let i: QueueService = interpreter;
export default i;