const express = require('express')
const api = express.Router()


api.use('/profile', require('./profile'))


module.exports = api