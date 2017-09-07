const crypto = require('crypto');
const utils = require('./utils');

class MagnetSigner {
    constructor(endpointUri, secretKey) {
        this._endpointUri = null;
        this._secretKey = null;
        this._hmac = null;
        this._endpointUri = endpointUri;
        this._secretKey = new Buffer(utils.GetBytes(secretKey));
    }

    GetSignatureUsingCanonicalQueryString(methodName, canonicalQueryString, requestMethod) {
        const stringToSign = `${requestMethod.toLowerCase()}\n${this._endpointUri.toLowerCase()}\n${methodName.toLowerCase()}\n${canonicalQueryString}`;
        const toSignBytes = utils.GetBytes(stringToSign);
        const toSignBuffer = new Buffer(toSignBytes);
        const signature = crypto.createHmac('sha256', this._secretKey).update(toSignBuffer).digest('base64');
        return utils.PercentEncodeRfc3986(signature);
    }

    GetSignedQueryString(methodName, request, requestMethod) {
        let requestObj = null;
        if (typeof request == 'string') { //request is Query String
            requestObj = this.CreateRequestObject(request);
        } else if (typeof request == 'object') { //request is an object / key - value
            requestObj = request;
        }
        requestObj['timestamp'] = this.GetTimestamp();
        requestObj = this.SortObj(requestObj);
        let canonicalQueryString = this.ConstructCanonicalQueryString(requestObj);
        let signature = this.GetSignatureUsingCanonicalQueryString(methodName, canonicalQueryString, requestMethod);
        let finalQueryString = `${canonicalQueryString}&signature=${signature}`;
        return finalQueryString;
    }

    CreateRequestObject(queryString) {
        const vars = {};
        let hash;
        const hashes = queryString.slice(queryString.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars[hash[0]] = unescape(hash[1]);
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
            formattedDate = formattedDate.substring(0, formattedDate.indexOf('.'));
            formattedDate += 'Z';
        }
        return formattedDate;
    }

    ConstructCanonicalQueryString(sortedRequestObject) {
        let queryString = '';
        if (sortedRequestObject && Object.keys(sortedRequestObject).length > 0) {
            for (let property in sortedRequestObject) {
                if (sortedRequestObject.hasOwnProperty(property)) {
                    queryString += utils.PercentEncodeRfc3986(property);
                    queryString += '=';
                    queryString += utils.PercentEncodeRfc3986(sortedRequestObject[property]);
                    queryString += '&';
                }
            }
            queryString = queryString.substring(0, queryString.length - 1);
        }
        return queryString;
    }
}

module.exports = MagnetSigner;
