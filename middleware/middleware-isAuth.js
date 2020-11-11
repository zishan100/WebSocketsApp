const jwt = require('jsonwebtoken');


module.exports = (req,res,next) => {
    
    
const authHeader = req.get("authorization").split(" ")[1];

    // console.log('Authen', authHeader);
    if (!authHeader) {
        const error = new Error('Not Authenticate');
        error.statusCode = 401;
        throw error;
     }

    const token = req.get('authorization').split(" ")[1];
      

    
    let decodetoken;
    try {
        decodetoken = jwt.verify(token, 'secrettoken');  

    } catch (err) {
        err.statusCode = 500;   
        throw err;
    }
    // console.log(decodetoken);
    if (!decodetoken)
    {
        const error = new Error('Not Authenticate');
        err.statusCode = 401;
        throw err;
    }  
    req.name = decodetoken.name;
    req.userId = decodetoken.userId;
    // console.log(req.userId);
    // console.log(req.name);
    next();
      
}



