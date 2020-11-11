const express = require("express");
const {body} = require('express-validator');
const router = express.Router();
const authController = require('../Controlller/authController');
const authen = require('../middleware/middleware-isAuth');
const User = require('../Modals/user'); 

router.put('/signUp', [
    body('email').trim()
        .isEmail()
        .withMessage('Please Enter Valid Input!')
        .custom((value, { req }) => {
          return  User.findOne({ email: value })
                .then(user => {
                    console.log(user,value);    
                if (user) {
                    return Promise.reject('Email Already Exists Please Try With SomeOther one');
                }
            })
        })
        .normalizeEmail(),
       body('password')
       .trim().isLength({ min: 5 }),
       body('name')
       .trim().isLength({min:3})
],authController.signUp);

router.post('/login',[ 
    body('email').trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please Enter Valid Input!')
        .custom((value, { req }) => {
          return  User.findOne({ email: value })
                .then(user => {
                    console.log(user,value);    
                if (!user) {
                    return Promise.reject('Please Enter valid Email');
                }
            })
        })
        ,
       body('password')
       .trim().isLength({ min: 5 }),
],authController.login);

router.get('/status', authen,authController.getStatus);
router.put('/status',authen,authController.UpdateStatus);

module.exports = router;