"use strict";
const request = require("request");
let options = {
    url: "http://CoaCinema.aa0.netvolante.jp/token/access_token",
    form: {
        refresh_token: "eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkX2F0IjoxNDc5MjYwODQ4LCJhdXRoX2lkIjoiMzMxNSJ9.jx-w7D3YLP7UbY4mzJYC9xr368FiKWcpR2_L9mZfehQ"
    }
};
request.post(options, (error, response, body) => {
    console.log(body);
});
