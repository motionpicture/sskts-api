/**
 * redis cacheクライアント
 *
 * @module
 */

import * as createDebug from 'debug';
import * as redis from 'redis';

const debug = createDebug('sskts-api:redisClient');
const CONNECT_TIMEOUT_IN_MILLISECONDS = 3600000;
const MAX_ATTEMPTS = 10;
const RESET_INTERVALS_IN_MILLISECONDS = 5000;

/**
 * 接続クライアントをリセットする
 * 接続リトライをギブアップした場合に呼び出される
 *
 * @see retry_strategy
 */
function resetClient() {
    // 一定時間後にクライアントを複製する
    debug('resetting client...');
    setTimeout(
        () => {
            redisClient = redisClient.duplicate();
            debug('client reset');
        },
        RESET_INTERVALS_IN_MILLISECONDS
    );
}

let redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_KEY,
    tls: { servername: process.env.TEST_REDIS_HOST },
    // If you return a number from this function, the retry will happen exactly after that time in milliseconds.
    // If you return a non-number, no further retry will happen and all offline commands are flushed with errors.
    // Return an error to return that specific error to all offline commands.
    retry_strategy: (options) => {
        debug('retrying...', options);
        if (options.error instanceof Error && (<any>options.error).code === 'ECONNREFUSED') {
            console.error(options.error);
            // redisClient = redisClient.duplicate();

            // End reconnecting on a specific error and flush all commands with a individual error
            // return new Error('The server refused the connection');
        }

        if (options.total_retry_time > CONNECT_TIMEOUT_IN_MILLISECONDS) {
            resetClient();

            // End reconnecting after a specific timeout and flush all commands with a individual error
            return new Error('Retry time exhausted');
        }

        if (MAX_ATTEMPTS > 0 && options.attempt > MAX_ATTEMPTS) {
            resetClient();

            return new Error('Retry attempts exhausted');
        }

        // reconnect after
        // tslint:disable-next-line:no-magic-numbers
        return Math.min(options.attempt * 100, 3000);
    }
});

// redisClient.on('ready', () => {
//     debug('ready');
// });

// redisClient.on('connect', () => {
//     debug('connected');
// });

// redisClient.on('reconnecting', () => {
//     debug('reconnecting...');
// });

// redisClient.on('error', (err: any) => {
//     console.error(err);
// });

// redisClient.on('end', () => {
//     debug('end');
// });

export default redisClient;
