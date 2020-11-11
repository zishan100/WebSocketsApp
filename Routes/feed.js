const express = require("express");
const {body} = require('express-validator');
const router = express.Router();
const feedController = require("../Controlller/feed");
const authen = require('../middleware/middleware-isAuth');
router.get("/posts/",authen,feedController.getposts);

router.post("/post",authen ,[
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({min:5}) 

] ,feedController.createPost);

router.get('/post/:postId',feedController.getpost);
router.put('/post/:postId',authen,
    [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
    ], feedController.UpdatePost);

router.delete('/delete/:postId', authen,feedController.DeletePost);

module.exports = router;
