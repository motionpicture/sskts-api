/**
 * クレジットカード追加サンプル
 *
 * @ignore
 */

import * as createDebug from 'debug';

import * as sskts from '../lib/sskts-api';

const debug = createDebug('sskts-api:samples');

async function main() {
    const auth = new sskts.auth.GoogleToken(
        // tslint:disable-next-line:max-line-length
        'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY3ODU2OGM4YWRiMmVjYzA3ZDE0M2RiNTE0Y2M3YTk5NTIwN2RmMzYifQ.eyJhenAiOiI5MzI5MzQzMjQ2NzEtNjZrYXN1am50ajJqYTdjNWs0azU1aWo2cGFrcHFpcjQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5MzI5MzQzMjQ2NzEtNjZrYXN1am50ajJqYTdjNWs0azU1aWo2cGFrcHFpcjQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDgwMTczNzA5ODQ2NDQ2NDkyODgiLCJlbWFpbCI6Imlsb3ZlZ2FkZEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6InVKemN5RG9GLTNKZFUzb3pacmtHQmciLCJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiaWF0IjoxNTAxNDYwNTk4LCJleHAiOjE1MDE0NjQxOTgsIm5hbWUiOiJUZXRzdSBZYW1hemFraSIsInBpY3R1cmUiOiJodHRwczovL2xoNi5nb29nbGV1c2VyY29udGVudC5jb20vLVRpM29LMmwxNmJzL0FBQUFBQUFBQUFJL0FBQUFBQUFBNjNNL01Dc0JlWWNpWnpJL3M5Ni1jL3Bob3RvLmpwZyIsImdpdmVuX25hbWUiOiJUZXRzdSIsImZhbWlseV9uYW1lIjoiWWFtYXpha2kiLCJsb2NhbGUiOiJlbiJ9.hyuVgE49zy3YUkNUPVVFW4_RFKxc7tGCAIocp5qmqjX9p0nMwR5l_aTQNtxitVy-reYZp4IV8qZTldwBH_MQTHiSr0VE50TdZ66TWBFhn2HXUSUs2mYFODJbAy-Sohi4tmGHcl3sac60B1EDAazJdeab0vF4kP-4nBvXNNoKT9Fugdjya57zvmAk8PAseHHvitBn3qqPQOKTiBfYBg3ZDfH4NDBVRNksCzTED7BbkaNfNxceDt-1SLbpRA5RWcivv_73mdHVz_QOR6XqETU0LTrrZk-wpwZP50twjDhV97yN4EA5_1kKery2ZYdzlgGtPvXLVz93VqclgohlQuakUA',
        'teststate',
        ['people.creditCards']
    );

    let creditCards = await sskts.service.person.findMyCreditCards({
        auth: auth
    });
    debug('creditCards are', creditCards);

    await sskts.service.person.addMyCreditCard({
        auth: auth,
        creditCard: {
            cardNo: '4111111111111111',
            cardPass: '111',
            expire: '2018',
            holderName: 'AA BB'
        }
    });
    debug('creditCard added');

    creditCards = await sskts.service.person.findMyCreditCards({
        auth: auth
    });
    debug('creditCards are', creditCards);
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err);
});
