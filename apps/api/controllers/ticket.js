"use strict";
const COA = require("../../common/utils/coa");
const TicketModel = require("../../common/models/ticket");
function importByTheaterCode(theaterCode) {
    return new Promise((resolveAll, rejectAll) => {
        COA.ticketInterface.call({
            theater_code: theaterCode
        }, (err, result) => {
            if (err)
                return rejectAll(err);
            if (!result)
                return rejectAll("result not found.");
            let promises = result.list_ticket.map((ticket) => {
                return new Promise((resolve, reject) => {
                    TicketModel.default.findOneAndUpdate({
                        _id: `${theaterCode}${ticket.ticket_code}`
                    }, {
                        theater: theaterCode,
                        code: ticket.ticket_code,
                        name: {
                            ja: ticket.ticket_name,
                            en: ticket.ticket_name_eng
                        },
                        name_kana: ticket.ticket_name_kana
                    }, {
                        new: true,
                        upsert: true
                    }, (err, ticket) => {
                        console.log("ticket updated.", ticket);
                        (err) ? reject(err) : resolve();
                    });
                });
            });
            Promise.all(promises).then(() => {
                resolveAll();
            }, (err) => {
                rejectAll(err);
            });
        });
    });
}
exports.importByTheaterCode = importByTheaterCode;
