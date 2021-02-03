require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

const api = require('./src/api')

app.use(morgan('dev'))

app.get('/', function (req, res) {
  res.send('Cus360 System')
})

app.use('/api',require('./src/middleware/auth') ,api)

app.use('/', require('./src/api/auth'))

app.listen(process.env.PORT, ()=>{
  console.log(`Server on http://127.0.0.1:${process.env.PORT}`)
})