let MagnetAPIClient = require('../src/magnetapiclient');

let ENDPOINT = "https://nlp.klangoo.com/Service.svc";
let CALK = "enter your calk here";
let SECRET_KEY = "enter your secret key here";

let client = new MagnetAPIClient(ENDPOINT, CALK, SECRET_KEY);

let request = { "text" : "Real Madrid transfer news",
                "lang" : "en",
                "format" : "json" };

client.CallWebMethod("ProcessDocument", request, "POST",
    function (json) {
        console.log(json);
    });