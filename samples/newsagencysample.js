/* Magnet Variables */

var ENDPOINT_URI = "http://magnetapi.klangoo.com/NewsAgencyService.svc";
var CALK = "ENTER_YOUR_CALK";
var SECRET_KEY = "ENTER_YOUR_SECRET_KEY";

var MagnetAPIClient = require('magnetapiclient');
var _magnetAPIClient = new MagnetAPIClient(ENDPOINT_URI, CALK, SECRET_KEY);


/* End Magnet Variables */


/* Magnet Sample Functions */

function addArticle(articleUID) {

  let request = {};
  request.text = "SAMPLE ARTICLE TEXT";
  request.title = "SAMPLE ARTICLE TITLE";
  request.insertDate = "23 JAN 2017 10:12:00 +01:00"; //article date
  request.url = "http://demo.klangoo.com/article-demo/api-example";
  request.articleUID = articleUID;
  request.source = "klangoo.com";
  request.language = "en";
  request.format = "json";

  try {
    _magnetAPIClient.CallWebMethod("AddArticle", request, "POST", function (data) {

      let parsedResult = JSON.parse(data);

      console.log("AddArticle: ");
      if (parsedResult.status == "OK") {
        console.log("Success", parsedResult);
      } else {
        HandleApiError(parsedResult);
      }

    });
  } catch (error) {
    console.log("Exception occured: ", error);
  }

}

function updateArticle(articleUID) {

  let request = {};
  request.text = "SAMPLE ARTICLE TEXT UPDATED";
  request.updateDate = "24 JAN 2017 10:12:00 +01:00";
  request.articleUID = articleUID;
  request.language = "en";
  request.format = "json";

  try {
    _magnetAPIClient.CallWebMethod("UpdateArticle", request, "POST", function (data) {

      let parsedResult = JSON.parse(data);

      console.log("UpdateArticle: ");


      if (parsedResult.status == "OK") {
        console.log("Success", parsedResult);
      } else {
        HandleApiError(parsedResult);
      }

    });
  } catch (error) {
    console.log("Exception occured:", error);
  }
}

function deleteArticle(articleUID) {

  let request = {};
  request.articleUID = articleUID;
  request.format = "json";

  try {
    _magnetAPIClient.CallWebMethod("DeleteArticle", request, "POST", function (data) {

      let parsedResult = JSON.parse(data);

      console.log("DeleteArticle: ");


      if (parsedResult.status == "OK") {
        console.log("Success", parsedResult);
      } else {
        HandleApiError(parsedResult);
      }

    });
  } catch (error) {
    console.log("Exception occured: ", error);
  }

}

function getArticle(articleUID) {

  let request = {};
  request.articleUID = articleUID;
  request.format = "json";

  try {
    _magnetAPIClient.CallWebMethod("GetArticle", request, "GET", function (data) {

      let parsedResult = JSON.parse(data);

      console.log("GetArticle: ");

      if (parsedResult.status == "OK") {
        console.log("Success", parsedResult);
      } else {
        HandleApiError(parsedResult);
      }

    });
  } catch (error) {
    console.log("Exception occured: ", error);
  }

}

function showIndex() {

  let request = {};
  request.page = 0;
  request.orderByDate = true;
  request.format = "json";

  try {
    _magnetAPIClient.CallWebMethod("ShowIndex", request, "GET", function (data) {

      let parsedResult = JSON.parse(data);

      console.log("ShowIndex: ");

      if (parsedResult.status == "OK") {
        console.log("Success", parsedResult);
      } else {
        HandleApiError(parsedResult);
      }

    });
  } catch (error) {
    console.log("Exception occured: ", error);
  }

}

function HandleApiError(response) {
  console.log("ERROR", "Error Code: " + response.error.errorNo, "Error Message: " + response.error.errorMessage);
}

/* End Magnet Sample Functions */

module.exports.RUN = function() {
  let articleUID = "2017/03/28/example-api-usage";
  addArticle(articleUID);
  updateArticle(articleUID);
  deleteArticle(articleUID);
  getArticle(articleUID);
  showIndex();
}