const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv/config')

const secret = process.env.secret;

const check_permission = (auth) => {

    if (!auth) { return false; }
    const BearerToken= auth.split(" ")
    const token=BearerToken[1];
    try{
        jwtvalues = jwt.verify(token, secret);
        if ( jwtvalues.type!=100) 
            return false;
        return true;
    }
    catch(error)
    {
        console.log("ERROR "+error)
        return false;
    }
}

let connection = mysql.createConnection( {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

router.post(`/add`, async  (req,res) => {
    // if( await !check_permission(req.headers.authorization) )
    //     return res.status(200).send( {status : false, message : "Permission denied to add Job!"})

    let sql = "INSERT INTO jobs SET ?";

    connection.query(sql, req.body, (err, results)=> {
        if ( !err )
        {
            console.log(results)
            return res.status(200).send( { status: true, message: "New Job Added!"} )
        }
        else
        { console.log(err)
            return res.status(200).send( { status: false, message: err.sqlMessage } );
        }
    })
})

router.get(`/get`, async (req, res) => {
//    if( await !check_permission(req.headers.authorization) )
  //      return res.status(400).send( {status : "Access denied!"})


    connection.query('SELECT name,description,rate,size FROM jobs', (err, rows) => {
    if (!err) {
        console.log("Rows returned :"+rows.length)
        if ( rows.length>0 )
        {   console.log("returning rows")
            return res.status(200).send( { success: true,
                                            jobs: rows})
        }
        else { return res.status(200).send( { success: false,
                                                message: "no Jobs added yet!"})}
    } 
    else {
        return res.status(400).send( {  success: false, message:'Failed to fetch jobs!'} );
    }});
})


    
router.put(`/amend`, async (req, res) => {
    // const BearerToken= req.headers.authorization.split(" ")
    // const token=BearerToken[1];
    // jwtvalues = jwt.verify(token, secret);
    // if ( jwtvalues.type!=100) 
    //      return res.status(400).send( {status : "Access denied!"})

    let name = req.body.name.toLowerCase();

    connection.query('SELECT * FROM jobs WHERE name = ?',[name], (err, rows) => {
        if (!err) {
            if ( rows.length>0){
                       
                const data = {
                    description  : (req.body.description)    ? req.body.description: rows[0].description,
                    rate         : (req.body.rate)    ? req.body.rate: rows[0].rate,
                    size         : (req.body.size)    ? req.body.size: rows[0].size,
                }
                
                let sql = "UPDATE jobs SET description='"+data.description+"', rate="+ data.rate+ ", size="+data.size+" WHERE name='"+req.body.name +"'";

                connection.query(sql, data, (err, results) => {
                    if ( err ){
                        console.log(err);
                        return res.status(400).send( { status: false,
                        message: err.sqlMessage});      
                    }
                    else
                    {
                        return res.status(200).send({status: 'Job details updated Successfully!',
                        message: results})    
                    } 
                })
            }
            else{
                return res.status(400).send( {  success: false, message:'INVALID JOB name! Cannot Update JOB'} );
            }
        } 
        else 
        {
            return res.status(400).send( {  success: false, message:'ERROR! Cannot Update JOB'} );
        }
    });
})



router.delete(`/:id`, async  (req,res) => {
    let sql = "DELETE FROM jobs WHERE ID='"+req.params.id+"'";

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
