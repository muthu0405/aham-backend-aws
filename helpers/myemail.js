const nodemailer = require('nodemailer')


module.exports = class emails 
{ 
    emailto(options)  
    {
        const transporter = nodemailer.createTransport( {
            service: "hotmail",
            auth: {
                user: "resetconfigs@outlook.com",
                pass: "FireExit12#"
            }
        });
     

        transporter.sendMail(options, (err, info)=> {
  //          console.log('in myemails.js '+options)

        if (err) {
            console.log(err)
            return;
        }
//        console.log("Sent: "+ info.response);
        })
    }
}
