class ErrorHandler extends Error {
    constructor(message , statuscode){
        super(message);
        this.statuscode = statuscode
    }
}

export const errorMiddleware = (err , req , res , next) => {
    err.message = err.message || "Internal sever happened";
    err.statuscode = err.statuscode || 500;

    if(err.name === "CastError"){
        const message = `Resource not found. Invalid${err.path}`;
        err = new ErrorHandler(message , 400);
    }
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message , 400);
    }
    if(err.name === "JsonWebTokenError"){
        const message = `Json Web Token is Invalid. Try Again`;
        err = new ErrorHandler(message , 400);
    }
    if(err.name === "TokenExpiredError"){
        const message = `Json Web Token is expired. Try Again`;
        err = new ErrorHandler(message , 400);
    }
    return res.status(err.statuscode).json({
        success: false,
        message: err.message
    });
};

export default ErrorHandler;