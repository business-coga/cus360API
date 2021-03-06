const express = require('express')
const user = express.Router()
const conn = require('../model/connect')


/*
Đáp ứng các yêu cầu sau:
Giới hạn kết quả trả về :  
limit 500, offset 1
*/

user.get('/:id', (req,res,next)=>{
    conn.query(q.getProfileById(req.params.id))
    .then(({rows}) => {
        if(rows.length == 0){
            res.send({})
        }else{
            req.profile = rows[0]
            req.cust_profile_ids = `'${req.profile.cust_profile_id}'`
            next()
        }
    })
    .catch(err => res.send(err))
},(req,res,next)=>{
    conn.query(q.getCustProfileSource(req.cust_profile_ids))
    .then(({rows})=>{
        req.profile.cust_profile_source = rows.filter(x => x.cust_profile_id == req.profile.cust_profile_id)
        next()
    })
}, (req,res,next)=>{
    conn.query(q.getCustEmail(req.cust_profile_ids))
    .then(({rows})=>{
        req.profile.cust_email = rows.filter(x => x.cust_profile_id == req.profile.cust_profile_id)
        next()
    })
}, (req,res,next)=>{
    conn.query(q.getCustPhone(req.cust_profile_ids))
    .then(({rows})=>{
        req.profile.cust_phone = rows.filter(x => x.cust_profile_id == req.profile.cust_profile_id)
        next()
    })
}, (req,res)=>{
    res.send(req.profile)
})

user.get('/', (req,res,next)=>{
    let {limit,offset,text} = q.getProfile(req.query.limit, req.query.offset, req.query.q)

    req.limit = parseInt(limit)
    req.offset = parseInt(offset)
    conn.query(q.getProfile(req.query.limit, req.query.offset, req.query.q))
    .then(({rows}) => {
        if(rows.length == 0){
            res.send({
                items : [],
                count : 0,
                limit : req.limit,
                offset : req.offset
            })
        }else{
            req.profile = rows
            let cust_profile_ids = ``
            rows.forEach(e=>{
                cust_profile_ids = `${cust_profile_ids}'${e.cust_profile_id}', `
            })
            req.cust_profile_ids = cust_profile_ids.slice(0, -2)
            next()
        }
    })
    .catch(err => res.send(err))
}, (req,res,next)=>{
    conn.query(q.getCustProfileSource(req.cust_profile_ids))
    .then(({rows})=>{
        for(let i=0; i<req.profile.length; i++){
            req.profile[i].cust_profile_source = rows.filter(x => x.cust_profile_id == req.profile[i].cust_profile_id)
        }
        next()
    })
}, (req,res,next)=>{
    conn.query(q.getCustEmail(req.cust_profile_ids))
    .then(({rows})=>{
        for(let i=0; i<req.profile.length; i++){
            req.profile[i].cust_email = rows.filter(x => x.cust_profile_id == req.profile[i].cust_profile_id)
        }
        next()
    })
}, (req,res,next)=>{
    conn.query(q.getCustPhone(req.cust_profile_ids))
    .then(({rows})=>{
        for(let i=0; i<req.profile.length; i++){
            req.profile[i].cust_phone = rows.filter(x => x.cust_profile_id == req.profile[i].cust_profile_id)
        }
        next()
    })
}, (req,res)=>{
    res.send({
        items : req.profile,
        count : req.profile.length,
        limit : req.limit,
        offset : req.offset
    })
})


const q = {
    getProfileById : function(id){
        return {
            text: `SELECT * FROM consolidate.cust_profile WHERE cust_profile_id = $1`, //RETURNING *
            values: [`${id}`],
        }
    },
    getProfile : function(limit = 25, offset = 0, q = ''){
        if(limit > 0 && limit < 500){
        }else{
            if(limit > 500){
                limit = 500
            }else{
                limit = 25
            }
        }
        if(offset > 0){

        }else{
            offset = 0
        }

        let condition = getCondition(q)
        return {
            text : `SELECT * FROM consolidate.cust_profile 
            ${condition != '' ? `WHERE ${condition}` : ''}
            LIMIT ${limit} OFFSET ${offset}`,
            values : [],
            limit : limit,
            offset : offset
        }
    },
    getCustProfileSource : function(cust_profile_ids){
        return {
            text : `SELECT * 
            from consolidate.cust_profile_info_source
            WHERE cust_profile_id IN (${cust_profile_ids})`
        }
    },
    getCustPhone : function(cust_profile_ids){
        return {
            text : `SELECT cust_phone_id, cust_profile_id, phone, phone_network, phone_type, status, description
            from consolidate.cust_phone
            WHERE cust_profile_id IN (${cust_profile_ids})`
        }
    },
    getCustEmail: function(cust_profile_ids){
        return {
            text : `SELECT cust_email_id, cust_profile_id, email, email_type, status, purpose
            from consolidate.cust_email
            WHERE cust_profile_id IN (${cust_profile_ids})`
        }
    },
}


function getCondition(q = ''){
    let result = ''
    let conditions = q.split(';')
    
    if(q.length > 3){
        conditions.forEach(e=>{
            result = `${result} AND ${e}`
        })
        result = result.substring(5)
        return result
    }else{
        return ''
    }
}

module.exports = user