const captcha = require('./tools/captcha')
const log     = require('./tools/logger')
const request = require('request')
const fs      = require('fs')

log('---------------------------')
log("-----Made by @Cody_Ncc-----")
log('---------------------------')
log('')

function main() {
    let config = JSON.parse(fs.readFileSync('config.json', 'utf-8'))
    let session = request.jar()
    let i = 0

    captcha({
        'apikey': config.capKey,
        'sitekey': '6LcrpQ0UAAAAAISIzEbWTqNyRV7mrknUQM1wg9QH',
        'url': 'https://privacy.com/auth/local'
    }, (token) => {
        let login = {
            url: 'https://privacy.com/auth/local',
            jar: session,
            method: 'post',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36'
            },
            json: {
                'email': config.email,
                'password': config.password,
                'extensionInstalled': 'false',
                'captchaResponse': token
            }
        }
        request(login, (err, res, body) => {
            if (res.statusCode == 200) {
                log('Login Success!', 'success')
                let token = JSON.stringify(body).split(',')[0].split(':')[1].replace('"', '').slice(0, 172)
                function create() {
                    let createOpts = {
                        url: 'https://privacy.com/api/v1/card',
                        jar: session,
                        method: 'post',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Origin': 'https://privacy.com',
                            'Referer': 'https://privacy.com/home',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36'
                        },
                        json: {
                            'memo': `${config.cardName} ${i}`,
                            'meta': { 'hostname': "" },
                            'hostname': "",
                            'reloadable': 'true',
                            'spendLimit': config.limit,
                            'spendLimitDuration': "MONTHLY",
                            'style': 'null',
                            'type': "MERCHANT_LOCKED",
                        }
                    }
                    request(createOpts, (err, res, opts) => {
                        if (res !== undefined) {
                            log(`Finished creating card ${config.cardName} ${i}`, 'success')
                            if (i < parseInt(config.amount))
                                setTimeout(create, 500)
                            else {
                                request({
                                    url: 'https://privacy.com/api/v1/card',
                                    jar: session,
                                    method: 'get',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Origin': 'https://privacy.com',
                                        'Referer': 'https://privacy.com/home',
                                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36'
                                    }
                                }, (err, res, body) => {
                                    fs.writeFileSync('cards.json', body, (err) => {
                                        log('Exported Cards to cards.json', 'success')
                                    })
                                })
                            }
                        }
                        i++
                    })
                }
                create();
            }
            else
                log('Login Failed...', 'error')
        })
    })
}
main();
