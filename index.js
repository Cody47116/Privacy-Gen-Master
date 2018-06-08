const captcha = require('./tools/captcha')
const log     = require('./tools/logger')
const request = require('request')
const fs      = require('fs')

log('---------------------------')
log("-----Made by @Cody_Ncc-----")
log('---------------------------')
log('')

function main() {
    let config  = JSON.parse(fs.readFileSync('config.json', 'utf-8'))
    let session = request.jar()
    let i       = 0

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
                let token = JSON.stringify(body).split(',')[0].split(':')[1].replace('"', '').slice(0, 172)
                log('Login Success!', 'success')

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
                        let cards    = JSON.parse(body)
                        let profiles = []

                        for (let i = 0; i < cards.cardList.length; i++) {
                            if (cards.cardList[i].state == "OPEN") {
                                profiles.push({
                                    "Billing"      : {
                                        "Address"  : config.address,
                                        "Apt"      : config.apt,
                                        "City"     : config.city,
                                        "FirstName": config.firstName,
                                        "LastName" : config.lastName,
                                        "State"    : config.state,
                                        "Zip"      : config.zip
                                    },
                                    "CCNumber"     : cards.cardList[i].PAN,
                                    "CVV"          : cards.cardList[i].CVV,
                                    "CardType"     : "Visa",
                                    "Country"      : config.country,
                                    "ExpMonth"     : cards.cardList[i].expMonth,
                                    "ExpYear"      : cards.cardList[i].expYear,
                                    "Name"         : cards.cardList[i].memo,
                                    "Phone"        : config.phone,
                                    "Same"         : true,
                                    "Shipping"     : {
                                        "Address"  : config.address,
                                        "Apt"      : config.apt,
                                        "City"     : config.city,
                                        "FirstName": config.firstName,
                                        "LastName" : config.lastName,
                                        "State"    : config.state,
                                        "Zip"      : config.zip
                                    }
                                })
                            }
                        }
                        fs.writeFileSync('profiles.json', JSON.stringify(profiles))
                        log('Exported Cards to profiles.json.', 'success')
                    })
                }
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
                        if (res !== undefined && res.statusCode == 200)
                            log(`Finished creating card ${config.cardName} ${i}`, 'success')
                        i++
                        if (i < parseInt(config.amount))
                            setTimeout(create, 500)
                    })
                }
            }
            else
                log('Login Failed. Try Again.', 'error')
        })
    })
}
main();
