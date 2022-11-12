function errorHandler(err, req, res, next) {
    if ( err.name === 'UnauthorizedError' ) {
       return res.status(401).json( { message: "The user is not authorized without valid token"})
    }
    if ( err.name === 'TokenExpiredError' ) {
        return res.status(401).json( { message: "Token has aleady expired, Login again."})
     }
    console.log("jwt Error: "+err);
    return res.status(500).json( { message: err})
}

module.exports = errorHandler;;
   