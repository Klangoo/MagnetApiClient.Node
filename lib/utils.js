function PercentEncodeRfc3986(str) {
    str = encodeURIComponent(str);
    str = str.replace(/'/g, '%27');
    str = str.replace(/\(/g, '%28');
    str = str.replace(/\)/g, '%29');
    str = str.replace(/\*/g, '%2A');
    str = str.replace(/!/g, '%21');
    str = str.replace(/%7e/gi, '~');
    str = str.replace(/\+/g, '%20');
    return str;
}

function GetBytes(str) {
    const bytes = [];
    let char;
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

module.exports = {
    PercentEncodeRfc3986,
    GetBytes
};
