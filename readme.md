**This library allows you to easily use the Magnet API via NodeJS.**

# Table of Contents

* [About](#about)
* [Installation](#installation)
* [Usage](#usage)

<a name="about"></a>
# About

Klangoo NLP API is a natural language processing (NLP) service that uses the rule-based paradigm and machine learning to recognize the aboutness of text. The service recognizes the category of the text, extracts key disambiguated topics, places, people, brands, events, and 41 other types of names; analyzes text using tokenization, parts of speech, parsing, word sense disambiguation, named entity recognition; and automatically finds the relatedness score between documents.

[Read More](https://klangoosupport.zendesk.com/hc/en-us/categories/360000812171-Klangoo-Natural-Language-API).

[Signup for a free trail](https://connect.klangoo.com/pub/Signup/)

<a name="installation"></a>
# Installation

## Prerequisites

- [NodeJS](https://nodejs.org/en/download/)
- An API Key Provided by [Klangoo](https://klangoosupport.zendesk.com/hc/en-us/articles/360015236872-Step-2-Registering-to-Klangoo-NLP-API)
- An API Secret Provided by [Klangoo](https://klangoosupport.zendesk.com/hc/en-us/articles/360015236872-Step-2-Registering-to-Klangoo-NLP-API)


## Install

To use MagnetApiClient in your NodeJS project, you can either <a href="https://github.com/Klangoo/MagnetApiClient.Node">download the Magnet API Library directly from our Github repository</a> and reference it in your project or, if you have the Node package manager installed, you can download it automatically by running

```
$ npm install @klangoo/magnetapiclient
```

Once you have the Magnet API Client properly referenced in your project, you can start sending calls to the API in your code.
For sample implementations, check the [NLP sample](https://github.com/Klangoo/MagnetApiClient.Node/blob/master/nlpsample.js).

## Dependencies

Magnet API Client uses the following Node built in Libraries:
- [HTTPS](https://nodejs.org/api/https.html)
- [Crypto](https://nodejs.org/api/crypto.html)
- [URL](https://nodejs.org/api/url.html)


<a name="usage"></a>
# Usage

This quick start tutorial will show you how to process a text

## Initialize the client

To begin, you will need to initialize the client. In order to do this you will need your API Key **CALK** and **Secret Key**.
You can find both on [your Klangoo account](https://connect.klangoo.com/).

```javascript
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
```


