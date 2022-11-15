var { expressjwt: jwt } = require("express-jwt");

function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return jwt({
        secret,
        algorithms: ['HS256']
    }).unless({
        path: [
            { url: /\/loan-api\/v1\/ledger(.*)/, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']},//working
            { url: /\/mk-api\/v1\/job(.*)/, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']},//working
            { url: /\/mk-api\/v1\/attendance(.*)/, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']},//working
            { url: /\/mk-api\/v1\/user(.*)/, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']},//working
            { url: /\/mk-api\/v1\/employee(.*)/, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']},//working
            { url: /\/mk-api\/v1\/password(.*)/, methods: ['GET', 'POST','PUT', 'DELETE', 'OPTIONS']},//working
            { url: /\/mk-api\/v1\/employee(.*)/, methods: ['GET',  'DELETE', 'OPTIONS']},//working
        ]                                                               //regex101.com
    })
}

module.exports = authJwt;
