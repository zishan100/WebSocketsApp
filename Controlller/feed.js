const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Post = require('../Modals/posts');
const User = require('../Modals/user');
const { get } = require("../Routes/feed");
const io = require('../sockets');
/*Here We Converting from JS Promises to Async Await */
exports.getposts =async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  
  try {
    let totalItem;
    totalItem =await Post.find().countDocuments()
     
    let post = await Post.find()
      .sort({createdAt:-1})
      .populate('creator')
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
   
    res.status(200).json({
      message: 'Fetching Posts Successfully', posts: post, totalItems: totalItem
    });
  } catch (err) {
    if (!err.statusCode)
    {
      err.statusCode = 500;   
    }
    next(err);
     
  }    
          
};

/* Create Post by post Request*/
exports.createPost =async (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  let creator;
  console.log(title, content);
  const errors = validationResult(req);  
  if (!errors.isEmpty())
  {
    const error = new Error('Validation Failed Entered Correct Data!');
    error.statusCode = 422;
    throw error;
     
  }
  if (!req.file)
  {
    const error = new Error('No file Provided');
    error.statusCode = 422;
    throw error; 
  }  
  console.log(req.file); 
  console.log(req.userId)
  const imageUrl = req.file.filename; 
  try {
    const post = new Post({
      title: title,
      content: content,
      imageUrl: `/image/${imageUrl}`,
      creator: req.userId,
    });
    await post.save();
    
    const user = await User.findById(req.userId)
    creator = user;
    user.posts.push(post)
    await user.save();
    io.getIO().emit('posts', { action: 'create', post: { ...post._doc, creator: {  name: user.name } } }) 
    
    res.status(201).json({
      message: "Successfully Created!",
      posts: post,
      creator: {
        _id: creator._id,
        name: creator.name,
      }
    });
  } catch (error) {
    if (err.statusCode)
    {
      err.statusCode = 500;  
    }
    next(err);
    }
};
/*get Request for Single Post */
exports.getpost = (req,res,next) => {
  const postId = req.params.postId;
  Post.findById(postId).then(post => {
    console.log(post);
    if (!post)
    {
      const error = new Error("Could Not found Post ");
      error.statusCode = 404;
      throw error;
    }
    console.log(post);
    res.status(200).json({ message: 'Post Found Successfully', post: post });   

  }).catch(err => {
    if (err.statusCode)
    {
      err.statusCode = 500;  
    }
    next(err);
   })
    
  
}

/* Put Request-->Update Post /post/:postId*/
exports.UpdatePost =async (req,res,next) => {
   
  const postId = req.params.postId;  
  const title = req.body.title;
  const content = req.body.content;
  const errors = validationResult(req);  
  if (!errors.isEmpty())
  {
    const error = new Error('Validation Failed Entered Correct Data!');
    error.statusCode = 422;
    throw error;
     
  }
  if (!req.file)
  {
    const error = new Error('No file Provided');
    error.statusCode = 422;
    throw error; 
  }    
  try {
    const post = await Post.findById(postId).populate('creator');
    console.log(post);
    if (!post) {
      const error = new Error('No Post Found');
      error.statusCode = 422;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error('UnAuthorization is not Allowed');
      error.statusCode = 422;
      throw error;
    }
     
    clearImage(post.imageUrl);
    post.title = title;
    post.content = content;
    post.imageUrl = `/image/${req.file.filename}`
    const result = await post.save()
     io.getIO().emit('posts',{action:'update',post:result}) 
    // console.log("Result Updated Post!", result);
    res.json({ message: 'Updated Post', posts: result });
  }
  catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error; 
  }
     
      
  
}
/* Delete Post Request:/post/post:Id */
exports.DeletePost =async (req,res,next) => {
  const postId = req.params.postId; 
  const userId = req.userId; 
  let newpost = [];

  try {
    const post = await Post.findById(postId);
  
    if (post.creator.toString() !== req.userId.toString()) {
      const error = new Error('Delete Operation is not Allowed  for UnAuthorization');
      error.statusCode = 422;
      throw error;
    }
    if (post.imageUrl) {
      clearImage(post.imageUrl);
    }
    await Post.findByIdAndDelete(postId);
  
    const user = await User.findById(req.userId);

    newpost = user.posts
    newpost = newpost.filter(post => {
      return post._id.toString() !== postId.toString();
    })
     user.posts = newpost;
     const result = await user.save()
    console.log('Deleted Post', result);
    io.getIO().emit('posts',{action:'delete',post:postId})
     res.status(201).json({
      message: 'Deleted Post!', result: result
    })
  }  
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
    
      
}


const clearImage = (filepath) => {
  filepath = path.join(__dirname, '..',filepath); 
   fs.unlink(filepath, err => {
    if (err)
    {
      throw err;  
    }
  })
}


