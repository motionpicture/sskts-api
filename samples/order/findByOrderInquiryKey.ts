/**
 * 注文照会サンプル
 *
 * @ignore
 */

import * as createDebug from 'debug';

import * as sskts from '../lib/sskts-api';

const debug = createDebug('sskts-api:samples');

async function main() {
    const auth = new sskts.auth.OAuth2(
        'motionpicture',
        'motionpicture',
        'teststate',
        ['orders.read-only']
    );

    const order = await sskts.service.order.findByOrderInquiryKey({
        auth: auth,
        orderInquiryKey: {
            telephone: '09012345678',
            orderNumber: 3045,
            theaterCode: '118'
        }
    });
    debug('order is', order);
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
