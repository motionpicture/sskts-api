import request = require('request');

let options = {
    url: 'http://localhost:8080/transactionItem/create/reservation',
    form: {
        transaction_id: "585c9a3abea301258844b455",
        transaction_password: "password",
        reservations: [
            {
                test: "test"
            },{
                performance: "12345",
                seat_code: "A-2",
            },{
                performance: "12345",
                seat_code: "A-3",
            },
            "test"
        ]
    }
};

request.post(options, (error, response, body) => {
    console.log(body);
});
