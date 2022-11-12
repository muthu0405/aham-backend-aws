const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const e = require('express');

require('dotenv/config')

const secret = process.env.secret;

let connection = mysql.createConnection( {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});


router.post(`/add`, async  (req,res) => {
//     const BearerToken= req.headers.authorization.split(" ")
//     const token=BearerToken[1];
// //    console.log(token)
//     jwtvalues = jwt.verify(token, secret);

//     if ( jwtvalues.type != 100) { //Admin user only register users
//         return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
//     }

    let sql = "INSERT INTO joblog SET ?";

    let query = connection.query(sql, req.body, (err, results)=> {
        if ( !err )
        {
            console.log(results)
            return res.status(200).send( { status: 'success'} )
        }
        else
        { console.log(err)
            return res.status(200).send( { status: err.sqlMessage } );
        }
    })
})


router.put(`/amend`, async (req, res) => {
    let employeeID = req.body.ID;

    connection.query('SELECT * FROM employees WHERE ID = ?',[employeeID], (err, rows) => {
        if (!err) {
            if ( rows.length>0){
                       
                const data = {
                    type    : (req.body.type)      ? req.body.type    : rows[0].type,
                    dob     : (req.body.dob)       ? req.body.dob     : rows[0].dob,
                    mobile  : (req.body.mobile)    ? req.body.mobile  : rows[0].mobile,
                    address : (req.body.email)     ? req.body.address : rows[0].address,
                    area    : (req.body.state)     ? req.body.area    : rows[0].area,
                    state   : (req.body.state)     ? req.body.state   : rows[0].state,
                }
                
                let sql = "UPDATE employees SET type="+data.type+",\
                                                dob='"+data.dob+"', \
                                                mobile='"+ data.mobile+ "',\
                                                address='"+data.address+"' \
                                                WHERE ID='"+employeeID +"'";

                connection.query(sql, data, (err, results) => {
                    if ( err ){
                        console.log(err);
                        return res.status(400).send( { status: false,
                        message: err.sqlMessage});      
                    }
                    else
                    {
                        return res.status(200).send({status: 'Employee proflie updated Successfully!',
                        message: results})    
                    } 
                })
            }
            else{
                return res.status(400).send( {  success: false, message:'INVALID Employee! Cannot Update Employee'} );
            }
        } 
        else 
        {
            return res.status(400).send( {  success: false, message:'ERROR! Cannot Update Employee'} );
        }
    });
})


router.get(`/get`, async (req, res) => {
//     const BearerToken= req.headers.authorization.split(" ")
//     const token=BearerToken[1];
// //    console.log(token)
//     jwtvalues = jwt.verify(token, secret);

//     if ( jwtvalues.type != 100) { //Admin user only register users
//         return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
//     }

    connection.query('SELECT * FROM joblog', (err, rows) => {
        if (!err) {
            if ( rows.length>0 )
            { return res.status(200).send( { status: true,
                                             joblog: rows})}
            else { return res.status(200).send( { status: true,
                                                  message: "no Joblog added yet!"})}
        } 
        else {
            return res.status(400).send( {  success: false, message:'Failed to fetch jobs completed!'} );
        }});
})

router.get(`/category`, async (req, res) => {
    // const BearerToken= req.headers.authorization.split(" ")
    // const token=BearerToken[1];
    // jwtvalues = jwt.verify(token, secret);

    // if ( jwtvalues.type != 100) { //Admin user only register users
    //     return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
    // }

    connection.query('SELECT * FROM employeecategory', (err, rows) => {
        if (!err) {
            if ( rows.length>0 )
            { return res.status(200).send( { status: true,
                                             employees: rows})}
            else { return res.status(200).send( { status: true,
                                                  message: "no Employees added yet!"})}
        } 
        else {
            return res.status(400).send( {  success: false, message:'Failed to fetch employees!'} );
        }});
})


router.delete(`/delete`, async  (req,res) => {
    const BearerToken= req.headers.authorization.split(" ")
    const token=BearerToken[1];
//    console.log(token)
    jwtvalues = jwt.verify(token, secret);

    if ( jwtvalues.type != 100) { //Admin user only register users
        return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
    }
    
    let sql = "DELETE FROM employees WHERE ID='"+req.body.ID+"'";

    let query = connection.query(sql,(err, results) => {
        if (!err)
        {
            return res.status(200).send( {status : results })
        }
        else
            return res.status(400).send( { status : err.sqlMessage })
    })
})



module.exports = router;
