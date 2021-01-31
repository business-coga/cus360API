const { Pool, Client } = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '123',
  port: 5432,
})

pool.connect().then(()=>{
    console.log('Database connected ...')
}).catch(err=>{console.log(err)})

module.exports  = pool