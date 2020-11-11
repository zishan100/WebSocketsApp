const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

const Post =new Schema ({
    title: {
        type: String,
        required:true         
   },   
    imageUrl: {
        type: String,
    },
    content: {
        type: String,
        required:true,
    } , 
    creator:{
        type: Schema.Types.ObjectId,
        ref:'user'
    }
},
{
  timestamps:true  
})


module.exports = mongoose.model('post', Post);
