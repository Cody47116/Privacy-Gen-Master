const request = require('request')
const log     = require('./logger')
const cheerio = require('cheerio')

const captcha = (info, callback) => {
    log('Requesting captcha...', 'info')
    request({
        url: `http://2captcha.com/in.php?key=${info.apikey}&method=userrecaptcha&googlekey=${info.sitekey}&pageurl=${info.url}`,
        method: 'post'
    }, (e, r, b) => {
        log('Waiting For Captcha...', 'info');

        let $     = cheerio.load(b);
        let capId = $('body').text().split('|')[1];
        
        function check(e, r, b) {
            request(`http://2captcha.com/res.php?key=${info.apikey}&action=get&id=${capId}`, (err, res, body) => {
                let $        = cheerio.load(body);
                let capToken = $('body').text();

                if (capToken == 'CAPCHA_NOT_READY') {
                    setTimeout(check, 2500);
                } else {
                    let capToken = $('body').text().split('|')[1];
                    callback(capToken)
                }
            })
        }
        check();
    })
}

module.exports = captcha;