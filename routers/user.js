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


router.post(`/register`, async  (req,res) => {
//    const BearerToken= req.headers.authorization.split(" ")
  //  const token=BearerToken[1];
//    console.log(token)
   // jwtvalues = jwt.verify(token, secret);

   // if ( jwtvalues.type != 100) { //Admin user only register users
   //     return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
   // }
    const passwordHash = bcrypt.hashSync(req.body.password,10)

    req.body.password = passwordHash;

//    console.log(req.body)

    let sql = "INSERT INTO users SET ?";

    let query = connection.query(sql, req.body, (err, results)=> {
        if ( !err )
        {
            console.log(results)
            return res.status(200).send( { status: true, message: "New User added!"} )
        }
        else
        { console.log(err);
            return res.status(200).send( { status: false, message: err.sqlMessage } );
        }
    })
})


router.post(`/login`, async (req, res) => {
    console.log("in "+req.body.login)
    let userID = req.body.login.toLowerCase();
    console.log("User login "+userID)
    connection.query('SELECT login,password,user_type FROM users WHERE login = ?',[userID], (err, rows) => {
        if (!err) {
            console.log(rows[0].password)

            if (bcrypt.compareSync(req.body.password, rows[0].password)) {
                const JWTtoken = jwt.sign(
                    {
                        userId : userID,
                        type   : rows[0].user_type
                    },
                    secret,   //secret key
                    {
                        expiresIn : "1d"
                    }
                )
                return res.status(200).send( { id: userID, key: JWTtoken} );
            }
            else {
                return res.status(200).send( {  success: false, message:'Invalid password'} );
            };            
        } 
        else {
            return res.status(200).send( {  success: false, message:'Invalid User'} );
        }});
})


router.put(`/amend`, async (req, res) => {
    let userID = req.body.login.toLowerCase();

    connection.query('SELECT login,user_type,mobile,email,state FROM users WHERE login = ?',[userID], (err, rows) => {
        if (!err) {
            if ( rows.length>0){
                       
                const data = {
                    user_type : (req.body.user_type) ? req.body.user_type : rows[0].user_type,
                    mobile    : (req.body.mobile)    ? req.body.mobile: rows[0].mobile,
                    email     : (req.body.email)    ? req.body.email: rows[0].email,
                    state     : (req.body.state)    ? req.body.email: rows[0].state,
                }
                
//                let sql = "UPDATE users SET user_type="+data.user_type+", mobile="+data.mobile+" email="+data.email+" state="+data.state+" WHERE login="+req.body.login;
                let sql = "UPDATE users SET user_type="+data.user_type+", email='"+ data.email+ "',mobile='"+data.mobile+"' WHERE login='"+req.body.login +"'";

                connection.query(sql, data, (err, results) => {
                    if ( err ){
                        console.log(err);
                        return res.status(400).send( { status: false,
                        message: err.sqlMessage});      
                    }
                    else
                    {
                        return res.status(200).send({status: 'User proflie updated Successfully!',
                        message: results})    
                    } 
                })
            }
            else{
                return res.status(400).send( {  success: false, message:'INVALID USER! Cannot Update User'} );
            }
        } 
        else 
        {
            return res.status(400).send( {  success: false, message:'ERROR! Cannot Update User'} );
        }
    });
})


router.get(`/get`, async (req, res) => {
//    const BearerToken= req.headers.authorization.split(" ")
  //  const token=BearerToken[1];
//    console.log(token)
  //  jwtvalues = jwt.verify(token, secret);

  //  if ( jwtvalues.type != 100) { //Admin user only register users
   //     return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
   // }

    connection.query('SELECT b.*, a.category FROM users as b INNER JOIN usercategory as a ON (b.user_type = a.ID);', (err, rows) => {
        if (!err) {
            if ( rows.length>0 )
            { return res.status(200).send( { status: true,
                                             users: rows})}
            else { return res.status(200).send( { status: false,
                                                  message: "no Users added yet!"})}
        } 
        else {
            return res.status(400).send( {  success: false, message:'Failed to fetch users!'} );
        }});
})


router.get(`/getcategory`, async (req, res) => {
    connection.query('SELECT * FROM usercategory', (err, rows) => {
        if (!err) {
            if ( rows.length>0 )
            { return res.status(200).send( { status: true,
                                             users: rows})}
            else { return res.status(200).send( { status: true,
                                                  message: "no Users added yet!"})}
        } 
        else {
            return res.status(400).send( {  success: false, message:'Failed to fetch users!'} );
        }});
})

router.delete(`/delete`, async  (req,res) => {
//     const BearerToken= req.headers.authorization.split(" ")
//     const token=BearerToken[1];
// //    console.log(token)
//     jwtvalues = jwt.verify(token, secret);

//     if ( jwtvalues.type != 100) { //Admin user only register users
//         return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
//     }
    
    let sql = "DELETE FROM users WHERE login='"+req.body.login+"'";

    let query = connection.query(sql,(err, results) => {
        if (!err)
        {
            return res.status(200).send( {status : results })
        }
        else
            return res.status(400).send( { status : err.sqlMessage })
    })
})

router.delete(`/:id`, async  (req,res) => {
    //     const BearerToken= req.headers.authorization.split(" ")
    //     const token=BearerToken[1];
    // //    console.log(token)
    //     jwtvalues = jwt.verify(token, secret);
    
    //     if ( jwtvalues.type != 100) { //Admin user only register users
    //         return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
    //     }
        
        let sql = "DELETE FROM users WHERE ID='"+req.params.id+"'";
    
        let query = connection.query(sql,(err, results) => {
            if (!err)
            {
                return res.status(200).send( {status : true, message: results })
            }
            else
                return res.status(400).send( { status : false, message: err.sqlMessage })
        })
    })
    


module.exports = router;
