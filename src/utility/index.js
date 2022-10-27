const crypto = require('crypto-js');

module.exports = {
    parse(string) {
        return crypto.AES.encrypt(string, process.env.SECRET).toString();
    },
    
    decode(string) {
        return crypto.AES.decrypt(string, process.env.SECRET).toString(crypto.enc.Utf8);
    }
}