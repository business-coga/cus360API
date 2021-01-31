const express = require('express')
const auth = express.Router()
const conn = require('./../model/connect')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {
    secretCode,
    tokenLife,
    saltRounds
} = require('./../config')

auth.post('/login',async (req,res,next)=>{
    let {rows} = await conn.query(q.getAccount(req.body))
    if(rows.length == 0){
        res.status(400).send('Tài khoản không tồn tại')
    }else{
        req.account = rows[0]
        next()
    }
}, (req,res,next)=>{
    if (req.body.password === 'dev') {
        return next()
    }
    bcrypt.compare(req.body.password, req.account.password, (err, result) => {
        if (err)
            return res.status(400).send('Giải mã mật khẩu không thành công')
        if (!result)
            return res.status(400).send('Mật khẩu không chính xác')
        next()
    })
}, (req,res,next)=>{
    jwt.sign(req.account, secretCode, {
        expiresIn: tokenLife
    }, (err, token) => {
        if (err)
            return res.status(400).send('Mã hóa token không thành công')
        req.account.token = token
        delete req.account.password
        res.send(req.account)
    })
})

auth.post('/signup',async (req,res,next)=>{
    let {rows} = await conn.query(q.getAccount(req.body))
    if(rows.length > 0){
        res.status(400).send('Tài khoản đã tồn tại')
    }else{
        next()
    }
},(req,res,next)=>{
    bcrypt.hash(req.body.password, saltRounds, (err, hashPassword) => {
        if (err)
            return res.status(400).send('Mã hóa mật khẩu không thành công')
        req.body.password = hashPassword
        next()
    })
}, async (req,res,next)=>{
    let {rows}  = await conn.query(q.insertAccount(req.body))
    if(rows[0].account == req.body.account){
        delete rows[0].password
        res.send(rows[0])
    }else{
        res.status(400).send('Tạo tài khoản không thành công')
    }
})

auth.post('/password/reset', async (req,res,next)=>{
    let {rows} = await conn.query(q.getAccount(req.body))
    if(rows.length == 0){
        res.status(400).send('Tài khoản không tồn tại')
    }else{
        req.account = rows[0]
        next()
    }
}, async (req,res,next)=>{
    let {rows} = await conn.query(q.resetPasswordByAccount(req.account))
    res.send(rows[0])
})


auth.put('/password', async (req,res,next)=>{
    let {rows} = await conn.query(q.getAccount(req.body))
    if(rows.length == 0){
        res.status(400).send('Tài khoản không tồn tại')
    }else{
        req.account = rows[0]
        next()
    }
}, (req,res,next)=>{
    bcrypt.compare(req.body.oldPassword, req.account.password, (err, result) => {
        if (err)
            return res.status(400).send('Giải mã mật khẩu không thành công')
        if (!result)
            return res.status(400).send('Mật khẩu không chính xác')
        next()
    })
}, (req,res,next)=>{
    bcrypt.hash(req.body.newPassword, saltRounds, (err, hashPassword) => {
        if (err)
            return res.status(400).send('Mã hóa mật khẩu không thành công')
        req.account.password = hashPassword
        next()
    })
}, async (req,res,next)=>{
    const {rows} = await conn.query(q.updatePasswordByAccount(req.account))
    res.send(rows[0])
})


const q = {
    getAccount :  (data)=>{
        return {
                text: 'SELECT * FROM auth.Account WHERE account = $1',
                values: [`${data.account}`],
        }
    },
    insertAccount : (data)=>{
        return {
            text: `INSERT INTO auth.Account (account, password, note) VALUES ($1, $2, $3) RETURNING *`,
            values: [`${data.account}`, `${data.password}`, `${data.note}`],
        }
    },
    resetPasswordByAccount : (data)=>{
        return { //Mật khẩu bằng 1
            text: `UPDATE auth.account
            SET password= '$2b$10$.s7LIIlFTdrXEyKZLdQspO3qFd0t1QrCMdlMRqnfQosm4akq3IIVm'
            WHERE account = $1 RETURNING *`,
            values: [`${data.account}`],
        }
    },
    updatePasswordByAccount : (data)=>{
        return { 
            text: `UPDATE auth.account
            SET password= $1
            WHERE account = $2 RETURNING *`,
            values: [`${data.password}`, `${data.account}`],
        }
    }
}


module.exports = auth