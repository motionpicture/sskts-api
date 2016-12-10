"use strict";
const request = require('request');
let options = {
    url: 'http://localhost:8080/reservation/removeTmps',
    form: {
        tmp_payment_no: '12345'
    }
};
request.post(options, (error, response, body) => {
    console.log(body);
});
