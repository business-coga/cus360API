const { Pool, Client } = require('pg')
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DB,
  password: process.env.DB_PASS,
  port: 5432,
})

pool.connect().then(()=>{
    console.log('Database connected!')
}).catch(err=>{console.log(err)})

module.exports  = pool