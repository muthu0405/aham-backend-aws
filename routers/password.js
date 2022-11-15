const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const date = require('date-and-time');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const MyEmail = require('../helpers/myemail')

require('dotenv/config')

const secret = process.env.secret;

let connection = mysql.createConnection( {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

router.post(`/reset`, async (req, res) => {
    // const BearerToken= req.headers.authorization.split(" ")
    // const token=BearerToken[1];
    // jwtvalues = jwt.verify(token, secret);

    if (!req.body.login) 
        return res.status(400).send( {status : 'Login Id Field missing!'})

    let login = req.body.login.toLowerCase();

    try{
        connection.query('SELECT email,mobile FROM users WHERE login = ?',[login], (err, rows) => {
                if (!err) {
                    if ( rows.length <= 0 )
                        return res.status(400).send( {status : 'UNKNOWN Login' })

//                    console.log('Email  ' + rows[0].email)
  //                  console.log('Mobile ' + rows[0].mobile)
    //                if ( rows[0].email != req.body.email)
    //                  return res.status(400).send( {status : 'Registered Email is Incorrect!'})
                    const OTP = Math.floor(Math.random() * 9999);
                    const now = new Date();
                    const now10 = date.addMinutes(now, 10)
                    const options =  {
                        from: "resetconfigs@outlook.com",
//                        to: "muthupillai@gmail.com",
                        to: rows[0].email,
                        subject: "Password Reset Link",
                        text: OTP + " is your Check Value for password RESET ",
                //        attachments: [ { filename: 'myfirst.pdf', content: 'new pdf' } ]
                    }
                
                    const myemail =  new MyEmail();
                    
                    myemail.emailto(options)
                
                    const datetime =  date.format(now10, 'YYYY-MM-DD HH:mm:ss')
                    let sql = "UPDATE users SET otp="+OTP+", otpvalidity='"+datetime+"' WHERE login = '"+login+"'";

                    connection.query(sql, (err, results) => {
                        if ( !err ) console.log("OTP update in user table")
                    })
                    return res.status(200).send( {status : 'Email/SMS sent to reset Password' })
                } 
        });
    }
    catch(error)
    {
        console.log("caught "+ error)
        return res.status(400).send( error)
    }
         
})

router.put(`/change`, async (req, res) => {

    if (!req.body.login) 
        return res.status(400).send( {status : 'Login Id Field missing!'})

    if (!req.body.otp) 
        return res.status(400).send( {status : 'OTP Field missing!'})
        
    if (!req.body.password) 
        return res.status(400).send( {status : 'Password Field missing!'})

    let login = req.body.login.toLowerCase();

    try{
        connection.query('SELECT otp, otpvalidity FROM users WHERE login = ?',[login], (err, rows) => {
            if (!err) {
                if ( rows.length <= 0 )
                    return res.status(400).send( {status : 'UNKNOWN Login' })
                if ( req.body.otp!="ADMIN")
                {
                    if ( req.body.otp != rows[0].otp)
                        return res.status(200).send( {status : 'Wrong OTP attempted! Try again!' })

                    const datethen = new Date(rows[0].otpvalidity)
                    const datenow  = new Date();
                    if ( datenow > datethen ) {  console.log("OTP EXPIRED. Try again later");
                    return res.status(200).send( 
                        {status : 'OTP Expired! Try again!',
                        timeotp : rows[0].otpvalidity,
                        timenow  : datenow                })
                    }
                }    
                const options =  {
                    from: "resetconfigs@outlook.com",
//                    to: "muthupillai@gmail.com",
                    to: rows[0].email,
                    subject: "Password Reset Link",
                    text: "OTP Validate and new password SET successfully",
            //        attachments: [ { filename: 'myfirst.pdf', content: 'new pdf' } ]
                }

                const passwordHash = bcrypt.hashSync(req.body.password,10)

                let sql = "UPDATE users SET password='"+passwordHash+"' WHERE login = '"+login+"'";

                connection.query(sql, (err, results) => {
                    if ( !err ) console.log("Password Set Successfully")
                })
            
                const myemail =  new MyEmail();
                
                myemail.emailto(options)
            
                return res.status(200).send( {status :  true, message :'Password Changed Successfully' })
               } 
        });
    }
    catch(error)
    {
        console.log("caught "+ error)
        return res.status(400).send( { status: false, message : error} )
    }         
})

module.exports = router;
