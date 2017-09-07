const urlParser = require('url');
const utils = require('./lib/utils');
const MagnetSigner = require('./lib/signer');
const fetch = require('request-promise');

class MagnetAPIClient {
    constructor(endpointUri, calk, secretKey) {
        this._calk = null;
        this._serverAddress = null;
        this._endpoint = null;
        this._magnetSigner = null;
        this._proxy = null;
        this._calk = calk;
        this._serverAddress = urlParser.parse(endpointUri).hostname;
        this._endpoint = urlParser.parse(endpointUri).path;

        if (secretKey) {
            this._magnetSigner = new MagnetSigner(endpointUri, secretKey);
        }
    }

    PrepareRequest(methodName, request) {
        //add calk to request, if it does not exist.
        if (!this.RequestHasCalk(request)) {
            //request is Query String
            if (typeof request == 'string') {
                if (request.trim() == '') {
                    request = `calk=${this._calk}`;
                } else {
                    request = `calk=${this._calk}&${request}`;
                }
            }  else if (typeof request == 'object') { //request is an object / key - value
                request.calk = this._calk;
            }
        }
    }

    GetQueryString(methodName, request, requestMethod, signRequest) {
        let queryString;
        if (signRequest && this._magnetSigner != undefined && this._magnetSigner != null) {
            queryString = this._magnetSigner.GetSignedQueryString(methodName, request, requestMethod);
        } else if (typeof request == 'object') {
            queryString = this.ConstructQueryString(request);
        } else if (typeof request == 'string') {
            queryString = request;
        }
        return queryString;
    }

    CallWebMethod(methodName, request, requestMethod, signRequest = true) {
        this.PrepareRequest(methodName, request);
        const queryString = this.GetQueryString(methodName, request, requestMethod, signRequest);

        let upperRequestMethod = requestMethod.toUpperCase();
        const requestObj = {
            method: upperRequestMethod,
            uri: `${this._serverAddress}/${this._endpoint}/${(upperRequestMethod == 'GET' ? `${methodName}?${queryString}` : methodName)}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        if (upperRequestMethod === 'POST') {
            requestObj.body = queryString;
        }
        return fetch(requestObj);
    }

    RequestHasCalk(request) {
        //request is Query String
        if (typeof request == 'string') {
            let queryStringLower = request.toLowerCase();
            if (queryStringLower.startsWith('calk=') || queryStringLower.contains('?calk=') || queryStringLower.contains('&calk=')) {
                return true;
            }
        } else if (typeof request == 'object') { //request is an object / key - value
            let calkFound = false;
            for (let prop in request) {
                if (request.hasOwnProperty(prop)) {
                    if (prop.toLowerCase() === 'calk') {
                        calkFound = true;
                    }
                }
            }
            return calkFound;
        }
        return false;
    }

    ConstructQueryString(request) {
        let queryString = '';
        if (request && Object.keys(request).length > 0) {
            for (let property in request) {
                if (request.hasOwnProperty(property)) {
                    queryString += utils.PercentEncodeRfc3986(property);
                    queryString += '=';
                    queryString += utils.PercentEncodeRfc3986(request[property]);
                    queryString += '&';
                }
            }
            queryString = queryString.substring(0, queryString.length - 1);
        }
        return queryString;
    }
}

module.exports = MagnetAPIClient;
