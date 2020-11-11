const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const User = require('../Modals/user');
const { json } = require('body-parser');
const user = require('../Modals/user');
/* SignUp :/auth/signUp */
exports.signUp = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    console.log(name, email, password);

    const errors = validationResult(req);
     console.log(errors.array());
    if (!errors.isEmpty())
    {
        const error = new Error('Validation Failed Entered Correct Data!');
        error.statusCode = 422;
        throw error;
    }  
     bcryptjs.hash(password, 12)
        .then(encryptpass => {
                 
            const user = new User({
                name: name,
                email: email,
                password:encryptpass
           })
            return user.save(); 
        })
        .then(user => {
            console.log("User SignUp Successfully",user)
            res.status(201).json({ message: 'Creating User Succesfully!',userId:user._id});  
             
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
              }
            next(error);
       }) 

}

/* login request:/auth/login  */

exports.login = (req,res,next) => {
    const email = req.body.email; 
    const password = req.body.password;
    
    const error = validationResult(req);
    if (!error.isEmpty()) {
        const error = new Error('Validation Failed Entered Correct Data!');
        error.statusCode = 422;
        throw error;   
    }
    User.findOne({ email: email })
        .then(user => {
            if (!user)
            {
            const error = new Error("No User Found!");
            error.statusCode = 404;
            throw error;   
            }
          
            return bcryptjs.compare(password, user.password)
            .then(isEqual => {
               
                if (!isEqual) {
                  const error = new Error('Paswword Does not Match!');
                    error.statusCode = 401;
                    throw error;
                }
                const token = jwt.sign({
                    name:user.name,
                    email:user.email,
                    userId:user._id.toString(),
                }, 'secrettoken', {
                   expiresIn:'1h'        
                })    
                res.status(200).json({ message: 'Login  Successfully', userId:user._id.toString(), token: token, email:user.email}); 
      
            }) 
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
              }
            next(error);
   }) 

}
/* Get Status */

exports.getStatus = (req,res,next) => {
    
    const userId = req.userId;
  
    User.findById(userId)
        .then(user => {
           
            if (!user)
             {
             const error = new Error("No User Found!");
             error.statusCode = 404;
             throw error;   
            }
            res.status(200).json({
               messsage:'Get Status',status:user.status 
            })  
            
        })
        .catch(error => {
            if (!err.statusCode) {
                err.statusCode = 500;
              }
            next(error); 
        })



}




/* Update Status post=>/auth/status */
exports.UpdateStatus = (req,res,next) => {
    const userId = req.userId;    
    const UpdateStatus = req.body.status; 
    // console.log(userId,req.body.status);
    User.findById(userId)
        .then(user => {
            if (!user)
            {
                const error = new Error("No User Found!");
                error.statusCode = 404;
                throw error;   
            } 
            user.status = UpdateStatus; 
            return user.save();
        })
        .then(result => {
            console.log("Updated Status");
            res.status(201).json({message:'status Updated' }) 
        })
        .catch(error => {
            if (!error.statusCode)
            {
                error.statusCode = 500;  
            }
            next(error);
        })




} 

