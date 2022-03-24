/**
 * Magnet API Client
 * 
 * dependencies:
 *    require('https')
 *    require('crypto')
 *    require('url')  
 */

"use strict";

class MagnetAPIClient {

    constructor(endpointUri, calk, secretKey) {
        this._calk = calk;
        this._proxy = null;
        this._http = require('https');
        
        const { URL } = require('url');
        const endpointURL = new URL(endpointUri);
        this._serverAddress = endpointURL.hostname;
        this._endpoint = endpointURL.pathname;

        this._magnetSigner = null;
        if (secretKey) {
            this._magnetSigner = new MagnetSigner(endpointUri, secretKey);
        }
    }

    CallWebMethod(methodName, request, requestMethod, callback, signRequest = true) {
        //add calk to request, if it does not exist.
        if (!this.RequestHasCalk(request)) {
            //request is Query String
            if (typeof request == "string") {
                if (request.trim() == "") {
                    request = "calk=" + this._calk;
                } else {
                    request = "calk=" + this._calk + "&" + request;
                }
            } //request is an object / key - value
            else if (typeof request == "object") {
                request.calk = this._calk;
            }
        }
        // end adding calk to request.

        let queryString;
        if (signRequest && this._magnetSigner != undefined && this._magnetSigner != null) {
            queryString = this._magnetSigner.GetSignedQueryString(methodName, request, requestMethod);
        } else if (typeof request == "object") {
            queryString = this.ConstructQueryString(request);
        } else if (typeof request == "string") {
            queryString = request;
        }

        this.CallWebMethod__(methodName, queryString, requestMethod, callback);
    }

    CallWebMethod__(methodName, queryString, requestMethod, callback) {
        let upperRequestMethod = requestMethod.toUpperCase();
        if (upperRequestMethod == "GET" || upperRequestMethod == "POST") {
            var magRequest = this._http.request({
                host: this._serverAddress,
                path: this._endpoint + '/' + (upperRequestMethod == "GET" ? methodName + '?' + queryString : methodName),
                method: upperRequestMethod,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            }, function (response) {
                response.setEncoding('utf8');
                let resBody = '';
                response.on('data', function (d) {
                    resBody += d; // Continuously update stream with data
                });
                response.on('end', function () {
                    callback(resBody);
                });
            });
        }
        if (upperRequestMethod == "POST") {
            let buffer = new Buffer.from(this.GetBytes(queryString));
            magRequest.write(buffer);
        }
        magRequest.end();
    }

    RequestHasCalk(request) {
        //request is Query String
        if (typeof request == "string") {

            let queryStringLower = request.toLowerCase();
            if (queryStringLower.startsWith("calk=") || queryStringLower.contains("?calk=") || queryStringLower.contains("&calk=")) {
                return true;
            }
        } //request is an object / key - value
        else if (typeof request == "object") {

            let calkFound = false;
            for (let prop in request) {
                if (request.hasOwnProperty(prop)) {
                    if (prop.toLowerCase() === "calk") {
                        calkFound = true;
                    }
                }
            }
            return calkFound;
        }
        return false;
    }

    ConstructQueryString(request) {
        let queryString = "";
        if (request && Object.keys(request).length > 0) {
            for (let property in request) {
                if (request.hasOwnProperty(property)) {
                    queryString += this.PercentEncodeRfc3986(property);
                    queryString += "=";
                    queryString += this.PercentEncodeRfc3986(request[property]);
                    queryString += "&";
                }
            }
            queryString = queryString.substring(0, queryString.length - 1);
        }
        return queryString;
    }

	PercentEncodeRfc3986(str) {
		str = encodeURIComponent(str);
		str = str.replace(/'/g , "%27");
		str = str.replace(/\(/g , "%28");
		str = str.replace(/\)/g , "%29");
		str = str.replace(/\*/g , "%2A");
		str = str.replace(/!/g , "%21");
		str = str.replace(/%7e/gi , "~");
		str = str.replace(/\+/g , "%20");
		return str;
	}

    CharIsLetter(char) {
        char = char.toLowerCase();
        return char.length === 1 && char.match(/[a-z]/i);
    }

    GetBytes(str) {
        let bytes = [], char;
        str = encodeURI(str);
        while (str.length) {
            char = str.slice(0, 1);
            str = str.slice(1);
            if ('%' !== char) {
                bytes.push(char.charCodeAt(0));
            } else {
                char = str.slice(0, 2);
                str = str.slice(2);
                bytes.push(parseInt(char, 16));
            }
        }
        return bytes;
    }
}

class MagnetSigner {

    constructor(endpointUri, secretKey) {
        this._endpointUri = null;
        this._secretKey = null;
        this._hmac = null;
        this._crypto = require("crypto");
        this._endpointUri = endpointUri;
        this._secretKey = new Buffer.from(this.GetBytes(secretKey));
    }

    GetSignatureUsingCanonicalQueryString(methodName, canonicalQueryString, requestMethod) {
        let stringToSign = requestMethod.toLowerCase() +
            '\n' +
            this._endpointUri.toLowerCase() +
            '\n' +
            methodName.toLowerCase() +
            '\n' +
            canonicalQueryString;

        let toSignBytes = this.GetBytes(stringToSign);
        let toSignBuffer = new Buffer.from(toSignBytes);

        let signature = this._crypto.createHmac('sha256', this._secretKey).update(toSignBuffer).digest('base64');
        return this.PercentEncodeRfc3986(signature);
    }

    GetSignedQueryString(methodName, request, requestMethod) {
        let requestObj = null;
        //request is Query String
        if (typeof request == "string") {
            requestObj = this.CreateRequestObject(request);
        } //request is an object / key - value
        else if (typeof request == "object") {
            requestObj = request;
        }

        requestObj["timestamp"] = this.GetTimestamp();
        requestObj = this.SortObj(requestObj);

        let canonicalQueryString = this.ConstructCanonicalQueryString(requestObj);
        let signature = this.GetSignatureUsingCanonicalQueryString(methodName, canonicalQueryString, requestMethod);
        let finalQueryString = canonicalQueryString + "&signature=" + signature;

        return finalQueryString;
    }

    PercentEncodeRfc3986(str) {
		str = encodeURIComponent(str);
		str = str.replace(/'/g , "%27");
		str = str.replace(/\(/g , "%28");
		str = str.replace(/\)/g , "%29");
		str = str.replace(/\*/g , "%2A");
		str = str.replace(/!/g , "%21");
		str = str.replace(/%7e/gi , "~");
		str = str.replace(/\+/g , "%20");
		return str;
	}

    CharIsLetter(char) {
        char = char.toLowerCase();
        return char.length === 1 && char.match(/[a-z]/i);
    }

    GetBytes(str) {
        var bytes = [], char;
        str = encodeURI(str);
        while (str.length) {
            char = str.slice(0, 1);
            str = str.slice(1);
            if ('%' !== char) {
                bytes.push(char.charCodeAt(0));
            } else {
                char = str.slice(0, 2);
                str = str.slice(2);
                bytes.push(parseInt(char, 16));
            }
        }
        return bytes;
    }

    CreateRequestObject(queryString) {
        var vars = {}, hash;
        var hashes = queryString.slice(queryString.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars[hash[0]] = decodeURIComponent(hash[1]);
        }
        return vars;
    }

    SortObj(unsortedObject) {
        let sortedKeys = [];
        for (var key in unsortedObject) {
            sortedKeys[sortedKeys.length] = key;
        }
        sortedKeys.sort(); //ASCII sort
        let sortedObject = {};
        for (var i = 0; i < sortedKeys.length; i++) {
            sortedObject[sortedKeys[i]] = unsortedObject[sortedKeys[i]];
        }
        return sortedObject;
    }

    GetTimestamp() {
        //ISO-8601 and the format is: YYYY-MM-DDTHH:mm:ss.sssZ
        let date = new Date();
        let formattedDate = date.toISOString();
        if (formattedDate.indexOf('.') != -1) {
            formattedDate = formattedDate.substring(0, formattedDate.indexOf("."));
            formattedDate += 'Z';
        }
        return formattedDate;
    }

    ConstructCanonicalQueryString(sortedRequestObject) {
        let queryString = "";
        if (sortedRequestObject && Object.keys(sortedRequestObject).length > 0) {

            for (let property in sortedRequestObject) {
                if (sortedRequestObject.hasOwnProperty(property)) {
                    queryString += this.PercentEncodeRfc3986(property);
                    queryString += "=";
                    queryString += this.PercentEncodeRfc3986(sortedRequestObject[property]);
                    queryString += "&";
                }
            }
            queryString = queryString.substring(0, queryString.length - 1);
        }
        return queryString;
    }
}

// export the class
module.exports = MagnetAPIClient;