console.log("mysqlAPI back-end");

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv/config');

const api = process.env.API_URL;

process.on('uncaughtException', (error,origin) => {
    console.log("----Uncaught exception---------")
    console.log(error)
    console.log("----Exception Origin-----------")
    console.log(origin)
})

process.on('unhandledRejection', (reason, promise) => {
    console.log("----unhandled Rejection ---------")
    console.log(promise)
    console.log("----reason-----------")
    console.log(reason)
})

const userRouter = require('./routers/user')
const passwordRouter = require('./routers/password')
const jobRouter = require('./routers/job')
const employeeRouter = require('./routers/employee')
const joblogRouter = require('./routers/joblog')
const attendanceRouter = require('./routers/attendance')

const app = express();
const errorhandler = require('./helpers/error-handler')
const authJwt = require('./helpers/jwt')

app.use(cors());
app.options('*', cors());

//Middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorhandler);

app.use(`${api}/user`, userRouter)
app.use(`${api}/password`, passwordRouter)
app.use(`${api}/job`, jobRouter)
app.use(`${api}/employee`, employeeRouter)
app.use(`${api}/joblog`, joblogRouter)
app.use(`${api}/attendance`, attendanceRouter)

app.get('/', (req, res)  => {
    res.send("hello mk api!");
})

const PORT = process.env.PORT || 4005;

app.listen(PORT, (err)=> {
    console.log("server started....! @port-> "+PORT);
}).err

