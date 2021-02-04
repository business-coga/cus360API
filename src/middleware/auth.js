const jwt = require('jsonwebtoken')
const {
    secretCode
} = require('./../config')
// const auth = require('basic-auth')
module.exports = function authencation(req, res, next) {
    const token = req.query.token ||
        req.query.access_token ||
        req.headers.token ||
        ((req.headers.authorization !== undefined) ? req.headers.authorization.replace("Bearer ", "") : null)
    if (token)
        jwt.verify(token, secretCode, (err, result) => {
            if (err)
                return res.status(400).send('Xác thực không thành công')
            req.account = result
            req.isAuthencation = true
            next()
        })
    else {
        res.status(400).send('Không tìm thấy thông tin xác thực')
    }
}