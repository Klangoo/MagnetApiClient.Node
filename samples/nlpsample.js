let MagnetAPIClient = require('@klangoo/magnetapiclient');

let ENDPOINT = "https://nlp.klangoo.com/Service.svc";
let CALK = "ENTER_YOUR_CALK";
let SECRET_KEY = "ENTER_YOUR_SECRET_KEY";

let client = new MagnetAPIClient(ENDPOINT, CALK, SECRET_KEY);


function callAPI(methodName) {
	let request = { "text" : "Real Madrid transfer news",
                "lang" : "en",
                "format" : "json" };

	client.CallWebMethod(methodName, request, "POST",
		function (json) {
			console.log("\n" + methodName + ":");
			console.log(json);
		});
}


//
// main
//
callAPI("ProcessDocument");

callAPI("GetSummary");

callAPI("GetEntities");

callAPI("GetCategories");

callAPI("GetKeyTopics");