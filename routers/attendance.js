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
        
    let sql = 'CALL attendance_log(?,?,?)';
    let message="success";
    req.body.attendance.forEach( element => {
        console.log(element)
        let query = connection.query(sql, element, (err, results)=> {
            if ( err )
            { console.log(err)
              message = err;
            }
            else {
                message = results;
            }
        })
    })
    return res.status(200).send( { status: message} )
})
    
router.post(`/addtype`, async  (req,res) => {
//     const BearerToken= req.headers.authorization.split(" ")
//     const token=BearerToken[1];
// //    console.log(token)
//     jwtvalues = jwt.verify(token, secret);

//     if ( jwtvalues.type != 100) { //Admin user only register users
//         return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
//     }

    let sql = "INSERT INTO attendancetype SET ?";

    let query = connection.query(sql, req.body, (err, results)=> {
        if ( !err )
        {
            console.log(results)
            return res.status(200).send( { status: true, message: "new type added"} )
        }
        else
        { console.log(err)
            return res.status(200).send( { status: false, message:  err.sqlMessage } );
        }
    })
})

router.get(`/:date`, async (req, res) => {
    //     const BearerToken= req.headers.authorization.split(" ")
    //     const token=BearerToken[1];
    // //    console.log(token)
    //     jwtvalues = jwt.verify(token, secret);
    
    //     if ( jwtvalues.type != 100) { //Admin user only register users
    //         return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
    //     }
   if (req.params.date === "type" )
    {
        connection.query('SELECT * FROM attendancetype', (err, rows) => {
            if (!err) {
                if ( rows.length>0 )
                { return res.status(200).send( { status: true,
                                                 attendanceTypes: rows})}
                else { return res.status(200).send( { status: true,
                                                      message: "no Attendance Type added yet!"})}
            } 
            else {
                return res.status(400).send( {  status: false, message:'Failed to fetch Attendance type completed!'} );
            }});    
    }else {
        connection.query('SELECT * FROM attendance WHERE date = ?',[req.params.date], (err, rows) => {
            if (!err) {
                if ( rows.length>0 )
                { return res.status(200).send( { status: true,
                                                 attendance: rows})}
                else { return res.status(200).send( { status: true,
                                                      message: "no Attendance added yet!"})}
            } 
            else {
                return res.status(400).send( {  success: false, message:'Failed to fetch Attendance completed!'} );
            }});
        }
    })
    
    router.put(`/amend`, async (req, res) => {
        // const BearerToken= req.headers.authorization.split(" ")
        // const token=BearerToken[1];
        // jwtvalues = jwt.verify(token, secret);
        // if ( jwtvalues.type!=100) 
        //      return res.status(400).send( {status : "Access denied!"})    
                    
        let sql = "UPDATE attendancetype SET description='"+req.body.description+ "',name ='"+req.body.name+"' WHERE ID="+req.body.ID;
    
        connection.query(sql, req.body, (err, results) => {
            if ( err ){
                console.log(err);
                return res.status(200).send( { status: false, message: err.sqlMessage});      
            }
            else
            {
                return res.status(200).send({status: true, message: 'Type details updated'})    
            } 
        })
    })
    
    


router.delete(`/deletetype/:id`, async  (req,res) => {
//    const BearerToken= req.headers.authorization.split(" ")
  //  const token=BearerToken[1];
//    console.log(token)
   // jwtvalues = jwt.verify(token, secret);

  //  if ( jwtvalues.type != 100) { //Admin user only register users
   //     return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
   // }
    
    let sql = "DELETE FROM attendancetype WHERE ID="+req.params.id;

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
