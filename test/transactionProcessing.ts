// tslint:disable-next-line:missing-jsdoc
import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
// import * as createDebug from 'debug';
import * as moment from 'moment';
import * as request from 'request-promise-native';

let count = 0;

const MAX_NUMBER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 1000;

setInterval(
    async () => {
        if (count > MAX_NUMBER_OF_PARALLEL_TASKS) {
            return;
        }
        count += 1;

        try {
            await execute();
        } catch (error) {
            console.error(error.message);
        }

        count -= 1;
    },
    INTERVAL_MILLISECONDS
);


// tslint:disable-next-line:max-func-body-length
async function execute() {
    let response: any;
    let gmoShopId = 'tshop00026096';
    let gmoShopPass = 'xbxmkaa6';




    // 取引開始
    // https://ja.wikipedia.org/wiki/UNIX%E6%99%82%E9%96%93
    console.log('starting transaction...');
    response = await request.post({
        url: 'http://localhost:8080/transactions',
        body: {
            expired_at: moment().add(1, 'minutes').unix(),
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
    });
    console.log('/transactions/start result:', response.statusCode, response.body);
    if (response.statusCode !== 201) throw new Error(response.body.message);
    let transactionId = response.body.data.id;

    let owners: Array<{
        id: string,
        group: string
    }> = response.body.data.attributes.owners;
    let promoterOwner = owners.find((owner) => {
        return (owner.group === 'PROMOTER');
    });
    let promoterOwnerId = (promoterOwner) ? promoterOwner.id : null;
    let anonymousOwner = owners.find((owner) => {
        return (owner.group === 'ANONYMOUS');
    });
    let anonymousOwnerId = (anonymousOwner) ? anonymousOwner.id : null;








    // 空席なくなったら変更する
    let theaterCode = '001';
    let dateJouei = '20170210';
    let titleCode = '8513';
    let titleBranchNum = '0';
    let timeBegin = '1010';
    let screenCode = '2';




    // 販売可能チケット検索
    let salesTicketResult = await COA.ReserveService.salesTicket({
        theater_code: theaterCode,
        date_jouei: dateJouei,
        title_code: titleCode,
        title_branch_num: titleBranchNum,
        time_begin: timeBegin,
    });








    // COA空席確認
    let getStateReserveSeatResult = await COA.ReserveService.getStateReserveSeat({
        theater_code: theaterCode,
        date_jouei: dateJouei,
        title_code: titleCode,
        title_branch_num: titleBranchNum,
        time_begin: timeBegin,
        screen_code: screenCode
    })
    let sectionCode = getStateReserveSeatResult.list_seat[0].seat_section;
    let freeSeatCodes = getStateReserveSeatResult.list_seat[0].list_free_seat.map((freeSeat) => {
        return freeSeat.seat_num;
    });
    console.log('freeSeatCodes count', freeSeatCodes.length);
    if (getStateReserveSeatResult.cnt_reserve_free === 0) throw new Error('no available seats.');




    // COA仮予約
    let reserveSeatsTemporarilyResult = await COA.ReserveService.reserveSeatsTemporarily({
        theater_code: theaterCode,
        date_jouei: dateJouei,
        title_code: titleCode,
        title_branch_num: titleBranchNum,
        time_begin: timeBegin,
        screen_code: screenCode,
        list_seat: [{
            seat_section: sectionCode,
            seat_num: freeSeatCodes[0]
        }, {
            seat_section: sectionCode,
            seat_num: freeSeatCodes[1]
        }]
    })
    console.log(reserveSeatsTemporarilyResult);

    // COAオーソリ追加
    console.log('adding authorizations coaSeatReservation...');
    let totalPrice = salesTicketResult[0].sale_price + salesTicketResult[0].sale_price;
    response = await request.post({
        url: `http://localhost:8080/transactions/${transactionId}/authorizations/coaSeatReservation`,
        body: {
            owner_id_from: promoterOwnerId,
            owner_id_to: anonymousOwnerId,
            coa_tmp_reserve_num: reserveSeatsTemporarilyResult.tmp_reserve_num,
            coa_theater_code: theaterCode,
            coa_date_jouei: dateJouei,
            coa_title_code: titleCode,
            coa_title_branch_num: titleBranchNum,
            coa_time_begin: timeBegin,
            coa_screen_code: screenCode,
            seats: reserveSeatsTemporarilyResult.list_tmp_reserve.map((tmpReserve) => {
                return {
                    performance: '001201701208513021010',
                    section: tmpReserve.seat_section,
                    seat_code: tmpReserve.seat_num,
                    ticket_code: salesTicketResult[0].ticket_code,
                    ticket_name_ja: salesTicketResult[0].ticket_name,
                    ticket_name_en: salesTicketResult[0].ticket_name_eng,
                    ticket_name_kana: salesTicketResult[0].ticket_name_kana,
                    std_price: salesTicketResult[0].std_price,
                    add_price: salesTicketResult[0].add_price,
                    dis_price: 0,
                    sale_price: salesTicketResult[0].sale_price,
                }
            }),
            price: totalPrice
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
    });
    console.log('addCOASeatReservationAuthorization result:', response.statusCode, response.body);
    if (response.statusCode !== 200) throw new Error(response.body.message);
    // let coaAuthorizationId = response.body.data._id;








    // GMOオーソリ取得
    let orderId = Date.now().toString();
    let entryTranResult = await GMO.CreditService.entryTran({
        shopId: gmoShopId,
        shopPass: gmoShopPass,
        orderId: orderId,
        jobCd: GMO.Util.JOB_CD_AUTH,
        amount: totalPrice,
    });

    let execTranResult = await GMO.CreditService.execTran({
        accessId: entryTranResult.accessId,
        accessPass: entryTranResult.accessPass,
        orderId: orderId,
        method: '1',
        cardNo: '4111111111111111',
        expire: '2012',
        securityCode: '123',
    });
    console.log(execTranResult);

    // GMOオーソリ追加
    console.log('adding authorizations gmo...');
    response = await request.post({
        url: `http://localhost:8080/transactions/${transactionId}/authorizations/gmo`,
        body: {
            owner_id_from: anonymousOwnerId,
            owner_id_to: promoterOwnerId,
            gmo_shop_id: gmoShopId,
            gmo_shop_pass: gmoShopPass,
            gmo_order_id: orderId,
            gmo_amount: totalPrice,
            gmo_access_id: entryTranResult.accessId,
            gmo_access_pass: entryTranResult.accessPass,
            gmo_job_cd: GMO.Util.JOB_CD_AUTH,
            gmo_pay_type: GMO.Util.PAY_TYPE_CREDIT,
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
    });
    console.log('addGMOAuthorization result:', response.statusCode, response.body);
    if (response.statusCode !== 200) throw new Error(response.body.message);
    // let gmoAuthorizationId = response.body.data._id;


}