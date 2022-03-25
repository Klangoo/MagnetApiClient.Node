let MagnetAPIClient = require('@klangoo/magnetapiclient');

let ENDPOINT = "https://nlp.klangoo.com/Service.svc";
let CALK = "ENTER_YOUR_CALK";
let SECRET_KEY = "ENTER_YOUR_SECRET_KEY";

let client = new MagnetAPIClient(ENDPOINT, CALK, SECRET_KEY);

function callAPI_Callback(methodName) {
	let request = { "text" : "Real Madrid transfer news",
                "lang" : "en",
                "format" : "json" };

	client.CallWebMethod(methodName, request, "POST",
		function (json) {
			console.log("\ncallAPI_Callback(" + methodName + "):");
			console.log(json);
		});
}

function callAPI_Promise(methodName) {
    let request = { "text" : "Real Madrid transfer news",
                "lang" : "en",
                "format" : "json" };

    client.CallWebMethod("ProcessDocument", request, "POST").then(function(json) {
		console.log("\ncallAPI_Promise(" + methodName + "):");
        console.log(json); 
    }, function(err) {
        console.log("Error occurred: " + err); 
    });
}

async function callAPI_Async(methodName) {
    let request = { "text" : "Real Madrid transfer news",
                "lang" : "en",
                "format" : "json" };
    try {
        let json = await client.CallWebMethod("ProcessDocument", request, "POST");
        console.log("\ncallAPI_Async(" + methodName + "):");
        console.log(json);
    }catch(err){
        console.log("Error occurred: " + err); 
    }
}


//
// main
//
callAPI_Callback("ProcessDocument");

callAPI_Promise("ProcessDocument");

callAPI_Async("ProcessDocument");

